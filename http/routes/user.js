import express, { Router } from "express";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import  {JSON_WEB_TOKEN_SECRET} from "../config.js";
import { object, string } from "zod";
import { authMiddleware } from "../middleware/middleware.js";
import { PrismaClient } from "@prisma/client";

const userRouter = Router();
const prisma = new PrismaClient();
const saltRounds = 10;

userRouter.use(express.json());

// ✅ Signup
userRouter.post("/signup", async (req, res) => {
  try {
    const schema = object({
      email: string().email(),
      password: string().min(6).max(100),
      username: string()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "error" });
    }

    const { email, password, username } = parsed.data;
    console.log(email, password, username)
    const hashedPassword = await hash(password, saltRounds);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, username }
    });
    console.log("JWT Secret:", JSON_WEB_TOKEN_SECRET);

    const token = jwt.sign({ id: user.id }, JSON_WEB_TOKEN_SECRET, { expiresIn: "1h" });
    const userId = user.id;
    res.json({ token, userId, message: "User signed up successfully" });
    console.log("User ID:", user.id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

// ✅ Signin
userRouter.post("/signin", async (req, res) => {
  const schema = object({
    email: string().email(),
    password: string().min(6).max(100)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await compare(password, user.password))) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    const token = sign({ id: user.id }, JSON_WEB_TOKEN_SECRET, { expiresIn: "1h" });

    res.json({ token, message: "User signed in successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

// ✅ Update user (requires auth)
userRouter.put("/", authMiddleware, async (req, res) => {
  const schema = object({
    email: string().email().optional(),
    password: string().min(6).max(100).optional(),
    username: string().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const updateData = parsed.data;

  try {
    if (updateData.password) {
      updateData.password = await hash(updateData.password, saltRounds);
    }

    const updated = await prisma.user.update({
      where: { id: req.userId }, // from authMiddleware
      data: updateData
    });

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

export { userRouter };
