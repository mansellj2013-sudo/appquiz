# PDF Resources Setup Guide

## Overview

Your quiz app now supports serving PDF files from Google Cloud Storage. Users can view and download study materials directly from your application.

## Prerequisites

- Google Cloud account with a project
- A Cloud Storage bucket created
- Service account credentials (JSON file)

## Setup Steps

### 1. Create Google Cloud Storage Bucket

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **Storage > Buckets**
4. Click **Create Bucket**
5. Configure:
   - **Name**: `appquiz-pdfs` (or any name)
   - **Location**: Choose region closest to your users
   - **Storage Class**: Standard
   - **Access Control**: Uniform
6. Click **Create**

### 2. Upload Your PDFs

1. Open your bucket in Google Cloud Storage
2. Click **Upload Folder** or drag & drop PDFs
3. Organize in folders if desired (e.g., `/manuals`, `/guides`)
4. Files in subfolders will be grouped by folder name in the UI

### 3. Create Service Account Credentials

1. Go to **APIs & Services > Credentials**
2. Click **+ Create Credentials > Service Account**
3. Fill in service account details:
   - **Service account name**: `quiz-app`
   - Click **Create and Continue**
4. Grant role:
   - **Role**: `Storage Object Admin`
   - Click **Continue**
5. Click **Create Key**
6. Choose **JSON** format
7. Download and save as `google-cloud-key.json` in project root

**⚠️ SECURITY WARNING**:

- Never commit `google-cloud-key.json` to Git
- It's already in `.gitignore` - keep it that way
- Store securely for production

### 4. Configure Environment Variables

Create a `.env` file in your project root:

```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_BUCKET=appquiz-pdfs
```

Replace:

- `your-project-id`: Your Google Cloud project ID
- `appquiz-pdfs`: quiz-app

### 5. Update Server Code

The code is already set up! The app will:

- Load credentials from `google-cloud-key.json`
- List all PDFs from your bucket
- Allow viewing in-browser with signed URLs
- Support downloading files

### 6. Test Locally

1. Place `google-cloud-key.json` in project root
2. Add `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_BUCKET` to `.env`
3. Start the app: `npm start`
4. Visit `http://localhost:3000`
5. Click **📚 PDF Resources**
6. PDFs should appear organized by folder

## Usage

### For Users

- **View**: Click "👁️ View" to open PDF in browser modal
- **Download**: Click "⬇️ Download" to download to device
- **Organize**: PDFs are grouped by folder name for easy browsing

### For Admins

1. Add new PDFs to your Google Cloud Storage bucket
2. No code changes needed - app auto-discovers files
3. Folder structure in bucket becomes categories in UI

## File Organization

Example bucket structure:

```
appquiz-pdfs/
├── manuals/
│   ├── user-guide.pdf
│   └── installation.pdf
├── guides/
│   ├── getting-started.pdf
│   └── faq.pdf
└── reference.pdf
```

Appears in UI as:

- **Guides** section with getting-started.pdf and faq.pdf
- **Manuals** section with user-guide.pdf and installation.pdf
- **Root** section with reference.pdf

## Security Features

✅ **Signed URLs** - Temporary access links (24-hour expiry)  
✅ **Path Validation** - Prevents directory traversal attacks  
✅ **Service Account** - Limited permissions (Storage Objects only)  
✅ **Credentials Hidden** - Never committed to Git  
✅ **Environment Variables** - Secrets stored separately

## Heroku Deployment

For Heroku, you'll need to:

1. **Add environment variables**:

   ```bash
   heroku config:set GOOGLE_CLOUD_PROJECT=your-project-id
   heroku config:set GOOGLE_CLOUD_BUCKET=appquiz-pdfs
   ```

2. **Add credentials file** (multiple methods):

   **Option A: Base64 encoded env var**

   ```bash
   # Encode the JSON file
   base64 google-cloud-key.json > encoded.txt

   # Set as env variable
   heroku config:set GOOGLE_CLOUD_CREDENTIALS=$(cat encoded.txt)
   ```

   Then update `pdfController.js` to decode and use it.

   **Option B: Use JSON as env var** (simpler)

   ```bash
   heroku config:set GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account",...}'
   ```

3. **Update pdfController.js** to load from env if available:
   ```javascript
   let storage;
   if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
     storage = new Storage({
       projectId: process.env.GOOGLE_CLOUD_PROJECT,
       credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS),
     });
   } else {
     storage = new Storage({
       projectId: process.env.GOOGLE_CLOUD_PROJECT,
       keyFilename: path.join(__dirname, "../google-cloud-key.json"),
     });
   }
   ```

## Troubleshooting

| Issue                              | Solution                                                                |
| ---------------------------------- | ----------------------------------------------------------------------- |
| "No PDFs appear"                   | Check bucket name matches `.env`                                        |
| "Authentication error"             | Verify `google-cloud-key.json` is in project root                       |
| "Permission denied"                | Add `Storage Object Admin` role to service account in IAM settings      |
| "serviceusage.services.use denied" | Go to IAM, find your service account, add `Service Usage Consumer` role |
| "PDFs won't download"              | Ensure service account has Storage Admin role                           |
| "Signed URL fails"                 | Check bucket permissions and signed URL expiry                          |

**To fix permission issues:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **IAM & Admin > IAM**
4. Find your service account (`quiz-app@your-project-id.iam.gserviceaccount.com`)
5. Click the pencil icon to edit
6. Ensure these roles are assigned:
   - **Storage Object Admin** - For reading/downloading from GCS
   - **Service Usage Consumer** - For using Google APIs
7. Click **Save**

## Cost Estimation

**Google Cloud Storage** (example for 56 MB):

- Storage: ~$0.02/month
- Network (outbound): ~$0.05/month per 100GB served
- Operations: Minimal

**Much cheaper than hosting PDFs within your app!**

---

## Support

For issues with Google Cloud Storage:

- [GCS Documentation](https://cloud.google.com/storage/docs)
- [Node.js GCS Library](https://github.com/googleapis/nodejs-storage)
- [Google Cloud Support](https://cloud.google.com/support)
