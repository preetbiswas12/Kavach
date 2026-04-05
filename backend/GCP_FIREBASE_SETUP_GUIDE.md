# Complete GCP + Firebase Setup Guide for Kavach

**Last Updated**: April 5, 2026  
**Project**: Kavach Emergency Response System  
**Backend**: Firebase Serverless Architecture

---

## Prerequisites

- [ ] Google account with billing enabled
- [ ] pnpm package manager installed
- [ ] Firebase CLI installed (`npx firebase ...` or `pnpm install -D firebase-tools`)
- [ ] gcloud CLI installed (optional, for advanced GCP management)

---

## Phase 1: Create GCP Project (5 minutes)

### 1.1 Create Project in Google Cloud Console

```bash
# Option A: Via Google Cloud Console (Recommended for first-time setup)
# 1. Go to: https://console.cloud.google.com/
# 2. Click "Select a Project" → "NEW PROJECT"
# 3. Project name: kavach-production
# 4. Organization: (leave blank or select your organization)
# 5. Click CREATE
# 6. Wait for project to be created (~1 minute)

# Option B: Via gcloud CLI
gcloud projects create kavach-production --display-name="Kavach Emergency Response System"
gcloud config set project kavach-production
```

### 1.2 Enable Billing

```bash
# 1. Go to: https://console.cloud.google.com/billing/
# 2. Click "Link Billing Account"
# 3. Select or create a billing account
# 4. Select kavach-production project
# 5. Click "LINK BILLING ACCOUNT"

# Free tier provides:
# - $300 credits (12 months)
# - Generous free tier for Firestore, Cloud Functions, Cloud Storage
```

### 1.3 Enable Required APIs

```bash
# Via gcloud CLI:
gcloud services enable \
  firestore.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  storage-api.googleapis.com \
  datastore.googleapis.com \
  vertexai.googleapis.com \
  generativelanguage.googleapis.com

# Or manually:
# 1. Go to: https://console.cloud.google.com/apis/library
# 2. Search and enable each:
#    - Cloud Firestore API
#    - Cloud Functions API
#    - Cloud Build API
#    - Cloud Storage API
#    - Cloud Datastore API
#    - Vertex AI API
#    - Generative Language API (for Gemini)
```

---

## Phase 2: Create Firebase Project (3 minutes)

### 2.1 Link GCP Project to Firebase

```bash
# Via Firebase Console (Recommended):
# 1. Go to: https://console.firebase.google.com/
# 2. Click "Add Project"
# 3. Enter project name: "kavach-production"
# 4. Uncheck "Enable Google Analytics" (optional)
# 5. In "Link a Google Cloud project", select: "kavach-production"
# 6. Click "Create Project"

# Or use Firebase CLI create:
cd backend
npx firebase projects:create --display-name="Kavach" kavach-production
```

### 2.2 Verify Firebase Services

Go to [Firebase Console](https://console.firebase.google.com/) and verify:

- ✅ **Firestore Database**: Present (or Create)
- ✅ **Cloud Functions**: Ready
- ✅ **Cloud Storage**: Bucket created
- ✅ **Authentication**: Mail/Phone providers enabled
- ✅ **Cloud Messaging**: Enabled

---

## Phase 3: Set Up Service Account (5 minutes)

### 3.1 Create Service Account Key

```bash
# Via gcloud CLI:
gcloud iam service-accounts create kavach-backend \
  --display-name="Kavach Backend Service Account" \
  --project=kavach-production

# Create key file:
gcloud iam service-accounts keys create backend-key.json \
  --iam-account=kavach-backend@kavach-production.iam.gserviceaccount.com \
  --project=kavach-production

# Or manually via Google Cloud Console:
# 1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
# 2. Select project: kavach-production
# 3. Click "CREATE SERVICE ACCOUNT"
# 4. Service account name: kavach-backend
# 5. Click CREATE AND CONTINUE
# 6. Grant roles:
#    - Firebase Admin
#    - Cloud Functions Admin
#    - Cloud Datastore User
#    - Editor (for development)
# 7. Click CONTINUE → DONE
# 8. Click on created service account → KEYS tab
# 9. ADD KEY → Create new key → JSON
# 10. Download key file (keep it SECURE)
```

### 3.2 Configure Environment Variables

```bash
# Copy the backend-key.json contents to .env file:
cd backend

# Create .env from template:
cp .env.example .env

# Open .env and add service account key details:
# From backend-key.json:
FIREBASE_PROJECT_ID=kavach-production
FIREBASE_PRIVATE_KEY_ID=<from key>
FIREBASE_PRIVATE_KEY="<from key - copy multiline key>"
FIREBASE_CLIENT_EMAIL=kavach-backend@kavach-production.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=<from key>
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=<from key>

# Add other API keys:
GEMINI_API_KEY=<get from GCP Console>
GOOGLE_MAPS_API_KEY=<get from GCP Console>
TWILIO_ACCOUNT_SID=<if using Twilio>
TWILIO_AUTH_TOKEN=<if using Twilio>
```

> ⚠️ **SECURITY WARNING**: Never commit `.env` file to Git! It's already in `.gitignore` but verify with `git status`

---

## Phase 4: Initialize Firestore Database (2 minutes)

```bash
# Create Firestore database:
gcloud firestore databases create \
  --region=us-central1 \
  --type=firestore-native \
  --project=kavach-production

# Test connection:
npx firebase databases list --project=kavach-production

# Enable offline persistence (optional):
# Already handled in Flutter app via FirebaseFirestore.instance.enablePersistence()
```

---

## Phase 5: Deploy Firestore Security Rules (1 minute)

```bash
cd backend

# Validate rules:
npx firebase rules:test \
  firestore_rules/firestore.rules \
  --project=kavach-production

# Deploy rules:
npx firebase deploy --only firestore:rules --project=kavach-production
```

---

## Phase 6: Deploy Query Indexes (1 minute)

```bash
# Firestore automatically suggests needed indexes,
# but you can pre-deploy them:

npx firebase deploy --only firestore:indexes --project=kavach-production
```

---

## Phase 7: Prepare Cloud Functions (5 minutes)

### 7.1 Verify Cloud Functions Files

```bash
# Check files exist:
ls -la cloud_functions/
# Expected:
#   - incident_processor.js
#   - notification_sender.js
#   - package.json
#   - index.js (if it exists, combines exports)
```

### 7.2 Update cloud_functions/package.json

Ensure Cloud Functions have correct dependencies:

```json
{
  "name": "kavach-cloud-functions",
  "version": "1.0.0",
  "description": "Cloud Functions for Kavach",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "dependencies": {
    "firebase-functions": "^5.0.0",
    "firebase-admin": "^12.0.1",
    "@google-cloud/vertexai": "^1.0.0",
    "axios": "^1.6.5",
    "twilio": "^4.10.0"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  },
  "engines": {
    "node": "18"
  }
}
```

### 7.3 Create cloud_functions/index.js

```javascript
// cloud_functions/index.js
// Combines all Cloud Function exports

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { processIncident } = require('./incident_processor');
const { sendEmergencyNotification } = require('./notification_sender');

// Export functions to Firebase
exports.processIncident = processIncident;
exports.sendEmergencyNotification = sendEmergencyNotification;
```

---

## Phase 8: Deploy Cloud Functions (3 minutes)

```bash
# Deploy functions:
npx firebase deploy --only functions --project=kavach-production

# Watch logs during deployment:
npx firebase functions:log --project=kavach-production

# Test function invocation:
npx firebase functions:shell --project=kavach-production
# Then in the shell:
# > processIncident({incidentId: "test123"}, null)
```

---

## Phase 9: Verify Deployment (5 minutes)

### 9.1 Check Firestore

```bash
# List databases:
npx firebase databases list --project=kavach-production

# Check collections exist:
npx firebase firestore:delete --project=kavach-production --all-collections --recursive
# (Don't do this in production! Just verifying access)
```

### 9.2 Check Cloud Functions

```bash
# List deployed functions:
gcloud functions list --project=kavach-production

# Example output:
# NAME                              STATUS  TRIGGER                 RUNTIME
# processIncident                   ACTIVE  Cloud Firestore (incidents)  nodejs18
# sendEmergencyNotification         ACTIVE  HTTPS                   nodejs18
```

### 9.3 Test Firestore Connection

```bash
# Create a test document:
npx firebase firestore:import --project=kavach-production --import-path=/tmp/test-data.json
```

---

## Phase 10: Set Up GitHub CI/CD (Optional but Recommended)

### 10.1 Create Firebase Token

```bash
# Login to Firebase (creates ~/.firebaserc):
npx firebase login:ci --project=kavach-production

# This outputs a token - keep it SECRET!
# Add to GitHub repository secrets as: FIREBASE_TOKEN
```

### 10.2 Configure Cloud Build

```bash
# Push to GitHub triggers automatic Cloud Build:
git push origin main

# Verify in Cloud Console:
# https://console.cloud.google.com/cloud-build/builds?project=kavach-production
```

---

## Phase 11: Enable Gemini API (2 minutes)

```bash
# Enable Vertex AI API:
gcloud services enable vertexai.googleapis.com --project=kavach-production

# Get Gemini API key:
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Create API Key
# 3. Add to .env: GEMINI_API_KEY=<key>

# Test Gemini integration:
# Covered in separate GEMINI_INTEGRATION.md
```

---

## Common Issues & Solutions

### Issue: "Project not found"
```bash
# Solution: Specify project ID explicitly
npx firebase deploy --project=kavach-production
```

### Issue: "Permission denied" on Firestore
```bash
# Solution: Check service account has right roles
gcloud projects get-iam-policy kavach-production \
  --flatten="bindings[].members" \
  --format="table(bindings.role)"
```

### Issue: Cloud Functions deploy fails
```bash
# Check Node.js version (Cloud Functions supports 18+):
node --version

# Check function logs:
npx firebase functions:log --project=kavach-production

# Redeploy with verbose output:
npx firebase deploy --only functions --debug --project=kavach-production
```

### Issue: Firestore quota exceeded
```bash
# Monitor usage:
# https://console.cloud.google.com/firestore/usage/read?project=kavach-production

# Set alerts:
# https://console.cloud.google.com/monitoring/alerting/policies
```

---

## Verification Checklist

- [ ] GCP project "kavach-production" created with billing enabled
- [ ] Firebase project linked to GCP project
- [ ] Service account key created and `.env` configured
- [ ] `pnpm install` completed successfully in backend folder
- [ ] Firestore database created (native mode)
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed (incident_processor + notification_sender)
- [ ] Cloud Build pipeline configured (optional)
- [ ] Gemini API key added to `.env`
- [ ] Test function deployment successful

---

## Next Steps After Setup

1. **Deploy Mobile App**: Connect Flutter to Firebase via FlutterFire CLI
2. **Test Crash Detection**: Trigger incident creation and verify Firestore update
3. **Test Gemini Analysis**: Verify crash analysis response from Cloud Functions
4. **Set Up Monitoring**: Enable Firebase Console dashboards
5. **Configure Alerts**: Set up GCP alerts for errors/quota limits

---

## Useful Commands Reference

```bash
# Firebase CLI
firebase login                               # Authenticate
firebase projects:list                       # List projects
firebase deploy                              # Deploy everything
firebase deploy --only firestore:rules       # Deploy only Firestore rules
firebase deploy --only functions             # Deploy only Cloud Functions
firebase functions:log                       # View function logs
firebase emulators:start                     # Local emulation

# gcloud CLI
gcloud projects create <name>                # Create GCP project
gcloud services enable <service>             # Enable API
gcloud functions list                        # List Cloud Functions
gcloud firestore databases list              # List Firestore databases

# pnpm
pnpm install                                 # Install dependencies
pnpm run test                                # Run tests
pnpm run deploy                              # Deploy (from package.json script)
```

---

## Support & Documentation

- **Firebase Docs**: https://firebase.google.com/docs
- **Cloud Functions**: https://cloud.google.com/functions/docs
- **Firestore**: https://cloud.google.com/firestore/docs
- **Vertex AI**: https://cloud.google.com/vertex-ai/docs
- **Gemini API**: https://ai.google.dev/

---

**Need help?** Check the main `README.md` for architecture overview or `FIREBASE_SETUP.md` for quick reference.
