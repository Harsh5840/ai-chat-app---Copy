   const { Router } = require("express");
const { userRouter } = require("./user");
const { dashboardRouter } = require("./dashboard");
const {roomRouter} = require("./room");
const { chatRouter } = require("./chat");

const mainRouter = Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/dashboard", dashboardRouter);
mainRouter.use("/room" , roomRouter)
mainRouter.use("/chat" , chatRouter)

module.exports = {
    mainRouter: mainRouter
}
