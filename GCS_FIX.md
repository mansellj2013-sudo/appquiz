# Fixing Google Cloud Storage Permissions

## The Problem

The service account `quiz-app@gen-lang-client-0067104180.iam.gserviceaccount.com` doesn't have the required permissions to access the GCS bucket.

Error: `serviceusage.services.use` permission denied

## Solution

### Option 1: Fix IAM Permissions (Recommended for Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `gen-lang-client-0067104180`
3. Navigate to **IAM & Admin** → **IAM**
4. Find the service account: `quiz-app@gen-lang-client-0067104180.iam.gserviceaccount.com`
5. Click the pencil icon to edit permissions
6. Add these roles:
   - **Storage Object Admin** - For full GCS object access
   - **Service Usage Consumer** - For accessing Google APIs
7. Click **Save**

### Option 2: Check if Cloud Storage API is Enabled

1. In Google Cloud Console, go to **APIs & Services** → **Enabled APIs & Services**
2. Search for "Cloud Storage API"
3. If not enabled, click it and select **Enable**

### Option 3: Use Owner Role (Development Only)

For quick testing, give the service account a broader role:

1. In IAM, find your service account
2. Add the **Editor** or **Owner** role
3. Remove after testing in production

## Testing After Fix

Once permissions are fixed, restart the app:

```powershell
npm start
```

Then navigate to: `http://localhost:3000/pdfs`

The page should load and either display:

- An empty PDF list (if no PDFs uploaded yet) ✅
- A list of PDFs organized by folder (if you've uploaded PDFs) ✅

## Next Steps

After permissions are fixed:

1. Upload test PDFs to your GCS bucket `appquiz-pdfs`
2. Test the PDF viewer interface
3. Test downloading PDFs
4. Prepare for Heroku deployment

You can upload PDFs to the bucket using:

- Google Cloud Console web UI
- gsutil CLI: `gsutil cp *.pdf gs://appquiz-pdfs/`
- The app's PDF upload feature (if implemented)
