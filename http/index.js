import dotenv from 'dotenv';
dotenv.config();
//it should be on top of the file and remember to run npm i dotenv
import express from "express";
const app = express();
import cors from "cors";
import { mainRouter}  from "./routes/index.js";


//middlewares should be above router as order does matter here
app.use(cors());
app.use(express.json()); //we added this line to parse the request body as json

//main router
app.use("/api/v1", mainRouter);


app.listen(3001, (err) => {
  console.log("app is listening on port 3000");
  if (err) throw err;
}); 