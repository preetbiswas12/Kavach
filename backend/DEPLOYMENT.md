# Backend Deployment Checklist & Quick Reference

**Status**: Ready for deployment  
**Last Updated**: April 5, 2026  
**Architecture**: Firebase Serverless + Firestore + Cloud Functions  
**Backend Stack**: Node.js 18 + Firebase Admin SDK v12 + Vertex AI

---

## 🚀 Quick Deployment (10 minutes)

> **Prerequisites**: GCP project "kavach-production" created with billing, Firebase CLI installed locally

### Step 1: Authenticate with Firebase

```bash
cd backend
npx firebase login --project=kavach-production
# Opens browser - authenticate with your Google account
```

### Step 2: Verify Configuration

```bash
# Check firebase.json points to correct project
npx firebase projects:list

# Expected output should show: kavach-production listed
```

### Step 3: Deploy Everything

```bash
# Deploy in this order:
# 1. Deploy Firestore rules first (secures data)
npx firebase deploy --only firestore:rules --project=kavach-production

# 2. Deploy indexes (enables efficient queries)
npx firebase deploy --only firestore:indexes --project=kavach-production

# 3. Deploy Cloud Functions last (uses Firestore)
npx firebase deploy --only functions --project=kavach-production

# Or deploy everything at once:
npx firebase deploy --project=kavach-production
```

### Step 4: Verify Deployment

```bash
# Check function status
npx firebase functions:list --project=kavach-production

# Expected output:
# ✔ processIncident (Cloud Firestore trigger)
# ✔ sendEmergencyNotification (HTTPS callable)
# ✔ cleanupOldData (Scheduled function, daily 2 AM UTC)

# View recent logs
npx firebase functions:log --limit=50 --project=kavach-production
```

---

## 📋 Full Setup Process (First-Time Only)

### If you haven't created GCP/Firebase project yet:

See **[GCP_FIREBASE_SETUP_GUIDE.md](./GCP_FIREBASE_SETUP_GUIDE.md)** for complete step-by-step instructions.

### If you already have a project:

1. **Configure .env file**:
   ```bash
   cp .env.example .env
   # Fill in values from your Firebase service account key
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Deploy**:
   ```bash
   npx firebase deploy --project=kavach-production
   ```

---

## 🧪 Testing Cloud Functions Locally

### Start Local Emulator

```bash
# Start Firebase emulators (Firestore, Functions, Auth)
npx firebase emulators:start --project=kavach-production

# Output will show:
# ┌─────────────────────────────────────────────────────────────┐
# │ ✔  All emulators ready! It is now safe to connect your app. │
# │                                                              │
# │ Firestore Emulator:     0.0.0.0:8080                         │
# │ Cloud Functions Shell:  0.0.0.0:5001                         │
# │ Authentication Emulator: 0.0.0.0:9099                        │
# └─────────────────────────────────────────────────────────────┘
```

### Test processIncident Function

```bash
# In another terminal, create a test incident in Firestore emulator
curl -X POST http://localhost:8080/v1/projects/kavach-production/databases/(default)/documents/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "userId": {"stringValue": "user123"},
      "type": {"stringValue": "crash"},
      "location": {"mapValue": {
        "fields": {
          "latitude": {"doubleValue": 28.7041},
          "longitude": {"doubleValue": 77.1025}
        }
      }},
      "crashData": {"mapValue": {
        "fields": {
          "impactForce": {"doubleValue": 45.2},
          "speedBefore": {"doubleValue": 80},
          "speedAfter": {"doubleValue": 0}
        }
      }}
    }
  }'

# Watch logs in emulator:
# Cloud Function processIncident should trigger automatically
```

### Test sendEmergencyNotification Function

```bash
# Connect to Cloud Functions shell
npx firebase functions:shell --project=kavach-production

# In the shell, test the function:
> sendEmergencyNotification({
    incidentId: "test-incident-001",
    userId: "user123",
    emergencyContacts: [
      {name: "Mom", phone: "+91-9999999999"},
      {name: "Dad", phone: "+91-8888888888"}
    ]
  }, {auth: {uid: "user123"}})

# Should return success response
```

---

## 🛠️ Common Operations

### Deploy Only Cloud Functions (Fastest)

```bash
npx firebase deploy --only functions --project=kavach-production
```

### Deploy Only Firestore Rules

```bash
npx firebase deploy --only firestore:rules --project=kavach-production
```

### View Cloud Function Logs

```bash
# Last 50 lines:
npx firebase functions:log --limit=50 --project=kavach-production

# Filter by function name:
npx firebase functions:log processIncident --limit=20 --project=kavach-production

# Real-time streaming:
npx firebase functions:log --follow --project=kavach-production
```

### Delete a Cloud Function

```bash
# Functions are managed via code - to remove:
# 1. Delete from cloud_functions/index.js exports
# 2. Deploy: npx firebase deploy --only functions --project=kavach-production
```

### Rollback Deployment

```bash
# Firebase doesn't have built-in rollback, but you can:
# 1. Revert code changes in Git
# 2. Redeploy: npx firebase deploy --project=kavach-production

# Functions deployment is atomic - if it fails, previous version persists
```

---

## 🔍 Monitoring & Debugging

### Monitor Function Metrics

```bash
# In Google Cloud Console:
# https://console.cloud.google.com/functions?project=kavach-production

# Metrics available:
# - Executions (count)
# - Execution times (latency)
# - Error rate
# - Memory usage
# - Execution count by status
```

### Check Firestore Usage

```bash
# View realtime stats:
# https://console.firebase.google.com/project/kavach-production/firestore/usage

# Free tier limits:
# - 50K reads/day
# - 20K writes/day
# - 20K deletes/day
```

### Test Security Rules

```bash
# Validate rules syntax:
npx firebase rules:test firestore_rules/firestore.rules --project=kavach-production

# Test specific scenarios:
# See firestore_rules/ directory for test files
```

---

## 🔐 Environment & Secrets

### Important: Never Commit Secrets!

```bash
# .env is in .gitignore - verify:
git status | grep ".env"
# Should show: nothing

# Double-check:
git check-ignore .env
# Should output: .env
```

### Use GCP Secret Manager for Production

```bash
# Store Gemini API key in GCP Secret Manager:
gcloud secrets create gemini-api-key --data-file=gemini-key.txt \
  --project=kavach-production

# Reference in Cloud Functions:
const secrets = require('@google-cloud/secret-manager');
const client = new secrets.SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({
  name: 'projects/kavach-production/secrets/gemini-api-key/versions/latest',
});
const geminiKey = version.payload.data.toString('utf8');
```

---

## 📊 Cost Tracking

### Expected Monthly Costs (April 2026 estimates)

| Service | Free Tier | Paid Rate | Estimated Cost |
|---------|-----------|-----------|-----------------|
| Firestore (reads) | 50K/day | $0.06/100K | $0-5 |
| Firestore (writes) | 20K/day | $0.18/100K | $0-3 |
| Cloud Functions | 2M invocations | $0.40/1M | $0-5 |
| Cloud Storage | 5GB | $0.020/GB | $0-2 |
| **Total** | - | - | **~$5-15/month** |

### Monitor Budget Alerts

```bash
# Set up budget alert:
# https://console.cloud.google.com/billing/budgets?project=kavach-production
# Alert threshold: $50/month (safe limit during development)
```

---

## 🚨 Troubleshooting

### Issue: "Project not found"

```bash
# Solution 1: Ensure project selected in firebase.json
cat firebase.json | grep -A2 "projects"

# Solution 2: Explicitly specify project
npx firebase deploy --project=kavach-production

# Solution 3: Set default project
npx firebase use kavach-production
```

### Issue: "Permission denied" on Cloud Functions

```bash
# Check service account roles:
gcloud projects get-iam-policy kavach-production \
  --flatten="bindings[].members" \
  --filter="members:*@iam.gserviceaccount.com"

# Grant missing role:
gcloud projects add-iam-policy-binding kavach-production \
  --member="serviceAccount:kavach-backend@kavach-production.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.developer"
```

### Issue: "Functions deployment timeout exceeded"

```bash
# Cloud Functions have 9-minute deploy timeout
# Solutions:
# 1. Split large functions into smaller ones
# 2. Deploy with longer timeout (if possible):
#    gcloud functions deploy processIncident --timeout=600

# Check function size:
du -sh cloud_functions/
# Should be < 50MB
```

### Issue: Firestore trigger not firing

```bash
# Verify:
# 1. Function deployed successfully:
npx firebase functions:list --project=kavach-production

# 2. Function code has Firestore trigger decorator:
grep "firestore.document" cloud_functions/index.js

# 3. Collection name matches:
# Code expects: incidents/{incidentId}
# Check Firestore that documents created are in "incidents" collection

# 4. Check function logs for errors:
npx firebase functions:log processIncident --project=kavach-production
```

---

## ✅ Pre-Deployment Checklist

- [ ] `.env` file created with all required keys
- [ ] `pnpm install` completed successfully
- [ ] No syntax errors in Cloud Functions code
- [ ] Firestore security rules validated: `npx firebase rules:test`
- [ ] `firebase.json` points to `kavach-production` project
- [ ] GCP project has billing enabled
- [ ] Firestore database exists (Cloud Firestore mode, native)
- [ ] Cloud Functions API enabled in GCP
- [ ] Service account has required IAM roles
- [ ] `.env` added to `.gitignore` (verify: `git check-ignore .env`)

---

## 📚 Related Documentation

- **Architecture**: [README.md](./README.md) - Complete architecture overview
- **Setup Guide**: [GCP_FIREBASE_SETUP_GUIDE.md](./GCP_FIREBASE_SETUP_GUIDE.md) - Detailed setup steps
- **Security Rules**: [firestore_rules/firestore.rules](./firestore_rules/firestore.rules) - Database security
- **Cloud Functions**: [cloud_functions/](./cloud_functions/) - Function implementations
- **Configuration**: [firebase.json](./firebase.json) - Firebase CLI config

---

## 🎯 Next Steps After Deployment

1. **Connect Mobile App**:
   - Run FlutterFire CLI: `flutterfire configure --project=kavach-production`
   - This generates `firebase_options.dart` in Flutter project

2. **Test End-to-End**:
   - Create test incident from mobile app
   - Verify Cloud Function triggers automatically
   - Check Gemini analysis appears in Firestore

3. **Set Up Monitoring**:
   - Enable Firebase console notifications
   - Set GCP budget alerts
   - Create Cloud Monitoring dashboards

4. **Implement Real Integrations**:
   - Twilio SMS/WhatsApp integration (notification_sender.js lines 148-175)
   - Real ambulance service API (incident_processor.js line 120)
   - Hospital bed availability API

---

**Last Update**: April 5, 2026  
**Maintainer**: Kavach Team  
**Support**: See main README.md for links
