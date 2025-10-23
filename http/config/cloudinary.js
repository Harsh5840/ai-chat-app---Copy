import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Validate Cloudinary env vars early and give actionable errors
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

function missingEnv(name) {
  return !name || name.trim() === '' || name === 'Root' || name.toLowerCase().includes('your');
}

if (missingEnv(CLOUD_NAME) || missingEnv(API_KEY) || missingEnv(API_SECRET)) {
  console.error('\n[Cloudinary] Invalid configuration detected.');
  if (missingEnv(CLOUD_NAME)) console.error(' - CLOUDINARY_CLOUD_NAME is missing or set to a placeholder (e.g. "Root").');
  if (missingEnv(API_KEY)) console.error(' - CLOUDINARY_API_KEY is missing or set to a placeholder.');
  if (missingEnv(API_SECRET)) console.error(' - CLOUDINARY_API_SECRET is missing or set to a placeholder.');
  console.error('\nPlease update http/.env with your Cloudinary credentials from https://cloudinary.com/console and restart the server.');
  // Throw an error so the app fails fast instead of producing confusing 401s later
  throw new Error('Invalid Cloudinary configuration. See the logs for details.');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export default cloudinary;
