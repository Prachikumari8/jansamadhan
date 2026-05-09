import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Authorize a service account to access Google Drive
 */
const authorize = async () => {
  // We'll assume the user will place the service account JSON in src/config/google-key.json
  // Or we use environment variables for each field
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
  return auth;
};

/**
 * Upload a file to Google Drive
 */
export const uploadFileToDrive = async (file) => {
  try {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: `jansamadhan_${Date.now()}_${file.originalname}`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    // 1. Upload the file
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    const fileId = response.data.id;

    // 2. Make the file public (so frontend can fetch it directly)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // 3. Delete local file after upload
    fs.unlinkSync(file.path);

    // Return direct thumbnail/view link for frontend
    // The format 'https://drive.google.com/uc?id={fileId}' allows direct display in <img> tags
    return {
      id: fileId,
      link: `https://drive.google.com/uc?export=view&id=${fileId}`,
    };
  } catch (error) {
    console.error('Google Drive Upload Error:', error);
    // Cleanup if upload failed
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw error;
  }
};
