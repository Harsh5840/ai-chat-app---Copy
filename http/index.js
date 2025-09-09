import dotenv from 'dotenv';
dotenv.config();
//it should be on top of the file and remember to run npm i dotenv
import express from "express";
const app = express();
import cors from "cors";
import { mainRouter}  from "./routes/index.js";


//middlewares should be above router as order does matter here
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); //we added this line to parse the request body as json

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

//health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "http-api"
  });
});

//main router
app.use("/api/v1", mainRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});
 