# Cloudinary Setup Guide

## 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click "Sign Up Free"
3. Create your account (free tier includes 25GB storage and 25GB bandwidth/month)

## 2. Get Your Cloudinary Credentials

1. After signing in, go to your [Cloudinary Console Dashboard](https://cloudinary.com/console)
2. You'll see your credentials in the "Account Details" section:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 3. Update Your .env File

Open `http/.env` and replace the placeholder values with your actual Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 4. Restart Your Backend Server

After updating the .env file, restart your backend server:

```bash
cd http
node index.js
```

## 5. Test File Upload

1. Go to a chat room
2. Click the paperclip icon or drag & drop a file
3. Select an image (PNG, JPG, JPEG, GIF, WEBP), PDF, or text file
4. Send the message
5. The file will be uploaded to Cloudinary and displayed in the chat!

## Features

✅ **Supported File Types:**
- Images: PNG, JPG, JPEG, GIF, WEBP
- Documents: PDF
- Text: TXT, MD

✅ **File Size Limit:** 10MB per file

✅ **Security:**
- Files are uploaded to a secure Cloudinary CDN
- Authentication required for uploads
- File type validation

✅ **Storage:**
- Files are organized in the `ai-chat-app` folder in your Cloudinary account
- Each file gets a unique name with timestamp

## Endpoints

### Upload File
- **Method:** POST
- **URL:** `/api/v1/upload`
- **Auth:** Required (Bearer token)
- **Body:** FormData with `file` field
- **Response:**
  ```json
  {
    "url": "https://res.cloudinary.com/...",
    "publicId": "ai-chat-app/1234567890-filename.jpg",
    "format": "jpg",
    "size": 12345,
    "fileName": "filename.jpg"
  }
  ```

### Delete File (Optional)
- **Method:** DELETE
- **URL:** `/api/v1/upload/:publicId`
- **Auth:** Required (Bearer token)

## Troubleshooting

### "Cloudinary configuration error"
- Check that all three environment variables are set correctly
- Make sure there are no spaces or quotes around the values
- Restart the backend after updating .env

### "File upload failed"
- Check file size (must be under 10MB)
- Verify file type is supported
- Check your Cloudinary account quota

### Images not displaying
- Check that the URL is valid
- Verify CORS settings in Cloudinary dashboard
- Check browser console for errors

## Cloudinary Dashboard

Access your uploaded files at: [https://cloudinary.com/console/media_library](https://cloudinary.com/console/media_library)

You can:
- View all uploaded files
- Delete files manually
- See storage usage
- Configure upload presets
- Set up transformations

## Cost & Limits (Free Tier)

- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **Transformations:** 25 credits/month
- **Image & video optimization:** Included
- **Secure HTTPS delivery:** Included

For more features, you can upgrade to a paid plan.
