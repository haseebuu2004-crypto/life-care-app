const { google } = require('googleapis');
const stream = require('stream');

class CloudStorageService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_DRIVE_CLIENT_ID,
            process.env.GOOGLE_DRIVE_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground' // Usually needed for refresh tokens
        );

        if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
            this.oauth2Client.setCredentials({
                refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
            });
        }

        this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    }

    isConfigured() {
        return !!(process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_REFRESH_TOKEN && this.folderId);
    }

    async uploadBackup(buffer, fileName, mimeType) {
        if (!this.isConfigured()) {
            throw new Error('Google Drive credentials are not fully configured in environment variables.');
        }

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        const fileMetadata = {
            name: fileName,
            parents: [this.folderId]
        };

        const media = {
            mimeType: mimeType,
            body: bufferStream
        };

        try {
            const response = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, webViewLink'
            });

            // Make the file readable by anyone with the link so the client can download it
            await this.drive.permissions.create({
                fileId: response.data.id,
                requestBody: { role: 'reader', type: 'anyone' }
            });

            return response.data.webViewLink;
        } catch (error) {
            console.error('Error uploading backup to Google Drive:', error);
            throw new Error('Cloud storage upload failed: ' + error.message);
        }
    }
}

module.exports = new CloudStorageService();
