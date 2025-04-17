import { Router } from "express"
import {userRouter} from "./user.js";         
import {dashboardRouter} from "./dashboard.js";   
import {roomRouter} from "./room.js";             
import {chatRouter} from "./chat.js";             
const mainRouter = Router()

mainRouter.use("/user", userRouter);
mainRouter.use("/dashboard", dashboardRouter);
mainRouter.use("/room", roomRouter);
mainRouter.use("/chat", chatRouter);

export { mainRouter }
