import { google } from 'googleapis';

export const listFilesOAuthController = async (req, res) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const folderId = req.user.googleDriveFolderId; // Get the user's folder ID from the database

        if (!folderId) {
            return res.status(200).json({ files: [] }); // No folder, return an empty list
        }

        const filesResponse = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, webViewLink, modifiedTime)',
        });

        res.status(200).json({ files: filesResponse.data.files });
    } catch (error) {
        console.error('Error fetching files from Google Drive:', error.message);
        res.status(500).json({ error: 'Failed to fetch files from Google Drive' });
    }
};