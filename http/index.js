import dotenv from 'dotenv';
dotenv.config();
//it should be on top of the file and remember to run npm i dotenv
import express from "express";
const app = express();
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import { mainRouter}  from "./routes/index.js";


const allowedOrigins = [
  "http://localhost:3000",
  "https://ai-chat-app-copy-lzjjz8e3y-harshs-projects-43abc943.vercel.app", // Vercel frontend
];

app.use(cors({
  origin: "*", // Allow all origins for testing; change to allowedOrigins in production
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); //we added this line to parse the request body as json

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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
 