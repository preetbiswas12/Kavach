# Kavach Backend - Firebase Architecture

**Updated**: April 5, 2026  
**Architecture**: Serverless Firebase Backend (No Node.js/Express)  
**Services**: Firestore, Cloud Functions, Cloud Storage, Authentication  
**Deployment**: Google Cloud Build + Cloud Run (optional) + Firebase Hosting

---

## 🏗️ New Architecture

```
┌─────────────────────────────────────┐
│    Flutter Mobile App (Dart)        │
│  - Gemini AI Integration            │
│  - Real-time Firestore listeners    │
│  - Direct API calls (no backend)    │
└──────────────┬──────────────────────┘
               │
      ┌────────▼────────┐
      │  Google Firebase │
      └────────┬────────┘
      ┌────────▼─────────────────────────┐
      │  Product Family (Google API)     │
      ├─────────────────────────────────┤
      │ • Authentication (Firebase Auth)│
      │ • Firestore (Real-time DB)      │
      │ • Cloud Functions (Backend API) │
      │ • Cloud Storage (Media)         │
      │ • Cloud Messaging (FCM)         │
      │ • Analytics (Google Analytics)  │
      └────────┬─────────────────────────┘
      ┌────────▼─────────────────────────┐
      │  Google AI/ML Services          │
      ├─────────────────────────────────┤
      │ • Gemini API (Crash Analysis)   │
      │ • Vertex AI (ML Pipelines)      │
      │ • TensorFlow Lite (On-device)   │
      └─────────────────────────────────┘
```

---

## 📂 Backend Directory Structure

```
backend/
├── cloud_functions/
│   ├── functions/
│   │   ├── incident_processor.js      # Process crash incidents
│   │   ├── ambulance_router.js         # Route to ambulance service
│   │   ├── hospital_finder.js         # Find optimal hospital
│   │   ├── gemini_analyzer.js         # Gemini crash analysis
│   │   ├── notification_sender.js     # Send emergency notifications
│   │   └── location_tracker.js        # Track location updates
│   ├── package.json                   # Cloud Functions dependencies
│   └── .env.local                     # Local testing config
│
├── firestore_rules/
│   ├── firestore.rules               # Security rules
│   ├── firestore.indexes.json         # Index definitions
│   └── performance_monitoring.rules   # Performance rules
│
├── gcp_deployment/
│   ├── app.yaml                       # Cloud Run deployment config
│   ├── cloudbuild.yaml               # CI/CD pipeline (Cloud Build)
│   ├── terraform/                    # Infrastructure as Code
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── github_actions.yml            # Alternative CI/CD
│
├── firebase.json                      # Firebase CLI config
└── README.md                          # This file
```

---

## 🔥 Firestore Database Schema

### Collections

#### **users**
```javascript
{
  uid: "firebase-uid",
  phoneNumber: "+91XXXXXXXXXX",
  name: "John Doe",
  email: "john@example.com",
  
  emergencyContacts: [
    {
      id: "contact-1",
      name: "Mother",
      phone: "+91XXXXXXXXXX",
      relation: "Mother",
      priority: 1,
      channels: ["sms", "call", "whatsapp"],
      verified: true
    }
  ],
  
  medicalInfo: {
    bloodGroup: "O+",
    allergies: ["Penicillin"],
    medications: ["Aspirin"],
    emergencyNotes: "Diabetic",
    lastUpdated: timestamp
  },
  
  settings: {
    crashDetectionEnabled: true,
    theftProtectionEnabled: true,
    autoDialAmbulance: true,
    countdownSeconds: 30,
    preferredHospitalType: "trauma_center",
    emergencyPhoneNumber: "+108",
    geminiAnalysisEnabled: true
  },
  
  subscription: {
    tier: "premium",
    validUntil: timestamp,
    features: ["advanced_analytics", "cloud_backup"]
  },
  
  profile: {
    profilePhotoUrl: "gs://bucket/photos/uid.jpg",
    createdAt: timestamp,
    updatedAt: timestamp,
    lastActiveAt: timestamp,
    location: {
      latitude: 28.7041,
      longitude: 77.1025,
      accuracy: 10,
      timestamp: timestamp
    }
  }
}
```

**Indexes**: `uid` (primary), `phoneNumber`, `createdAt`

---

#### **incidents**
```javascript
{
  id: "incident-uuid",
  userId: "firebase-uid",
  type: "crash",              // 'crash' | 'theft' | 'manual_sos'
  severity: "high",           // 'low' | 'medium' | 'high' | 'critical'
  status: "active",           // 'active' | 'false_alarm' | 'resolved'
  
  // Location
  location: {
    latitude: 28.7041,
    longitude: 77.1025,
    accuracy: 8,
    address: "Street name, Delhi",
    geoHash: "ttfa5"           // For efficient geo queries
  },
  
  // Crash-specific
  crashData: {
    accelerationForce: 85.5,   // G's
    speedBefore: 60,           // km/h
    speedAfter: 0,
    direction: "forward",
    audioDetected: true,
    impactConfidence: 0.92,
    crashScore: 85             // 0-100
  },
  
  // Gemini Analysis
  geminiAnalysis: {
    severity_assessment: "Critical - immediate ambulance needed",
    injury_prediction: "High risk of head/spinal injuries",
    recommended_action: "Call ambulance, check for consciousness",
    stay_in_vehicle: true
  },
  
  // Emergency Response
  response: {
    ambulanceCalled: true,
    ambulanceCallTime: timestamp,
    ambulanceETA: 5,            // minutes
    hospitalSelected: {
      id: "hospital-123",
      name: "Apollo Delhi",
      distance: 3.2,
      eta: 6,
      bedsAvailable: 2,
      specialization: "trauma_center"
    },
    contactsNotified: [
      {
        contactId: "contact-1",
        name: "Mother",
        channels: ["sms", "call"],
        notifiedAt: timestamp,
        acknowledged: true
      }
    ]
  },
  
  // Evidence
  evidence: {
    photoUrls: [
      "gs://bucket/incidents/incident-uuid/photo1.jpg",
      "gs://bucket/incidents/incident-uuid/photo2.jpg"
    ],
    audioUrl: "gs://bucket/incidents/incident-uuid/recording.m4a",
    videoUrl: "gs://bucket/incidents/incident-uuid/video.mp4",
    sensorLog: {
      accelerometer: [...],
      gyroscope: [...],
      gps: [...]
    }
  },
  
  timestamps: {
    detectedAt: timestamp,
    reportedAt: timestamp,
    resolvedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp
  },
  
  // Real-time tracking
  isLive: false,
  liveLocationUpdates: [
    { lat: 28.7041, lng: 77.1025, timestamp: timestamp }
  ]
}
```

**Indexes**: `userId + status`, `userId + type`, `geoHash`, `createdAt`

---

#### **locationHistory** (Subcollection under incidents)
```javascript
{
  id: "auto-generated",
  userId: "firebase-uid",
  latitude: 28.7041,
  longitude: 77.1025,
  accuracy: 8,
  speed: 45,
  heading: 120,
  timestamp: timestamp,
  isStealing: false,
  deviceStatus: "normal"  // 'normal' | 'stolen' | 'recovered'
}
```

**Note**: TTL set to 30 days (auto-delete)

---

#### **hospitals** (Pre-populated reference)
```javascript
{
  id: "hospital-123",
  name: "Apollo Delhi",
  type: "trauma_center",   // 'trauma_center' | 'general' | 'specialty'
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
    address: "Address"
  },
  contact: {
    phone: "+919876543210",
    emergency: "+919876543211"
  },
  facilities: ["trauma_center", "icu", "neurology", "orthopedics"],
  bedsAvailable: {
    general: 5,
    icu: 2,
    trauma: 3,
    lastUpdated: timestamp
  },
  distanceFromUser: null,  // Calculated on client
  averageRating: 4.5,
  reviews: 342
}
```

---

## 🔐 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users only
    function isAuth() {
      return request.auth != null;
    }

    // User is accessing their own data
    function isOwnUser(userId) {
      return request.auth.uid == userId;
    }

    // USERS collection
    match /users/{userId} {
      allow read: if isOwnUser(userId);
      allow create: if isOwnUser(userId) && request.resource.data.uid == request.auth.uid;
      allow update: if isOwnUser(userId);
      allow delete: if isOwnUser(userId);
    }

    // INCIDENTS collection
    match /incidents/{incidentId} {
      allow read: if isOwnUser(resource.data.userId);
      allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwnUser(resource.data.userId);
    }

    // Location history - subcollection within incidents
    match /incidents/{incidentId}/locationHistory/{docId} {
      allow read: if isOwnUser(get(/databases/$(database)/documents/incidents/$(incidentId)).data.userId);
      allow create: if isAuth();
      allow delete: if false;  // Never delete location history
    }

    // HOSPITALS collection - public read
    match /hospitals/{hospitalId} {
      allow read: if true;
      allow write: if false;  // Only backend can update
    }

    // EMERGENCY CONTACTS - user specific
    match /users/{userId}/emergencyContacts/{contactId} {
      allow read: if isOwnUser(userId);
      allow create: if isOwnUser(userId) && request.resource.data.userId == userId;
      allow update: if isOwnUser(userId);
      allow delete: if isOwnUser(userId);
    }
  }
}
```

---

## ☁️ Cloud Functions

### **1. incident_processor.js**
Triggered when crash is detected

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.processIncident = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    const incident = snap.data();
    
    // 1. Analyze with Gemini
    const analysis = await analyzeWithGemini(incident);
    
    // 2. Find nearby ambulance
    const ambulance = await findNearbyAmbulance(incident.location);
    
    // 3. Select best hospital
    const hospital = await selectOptimalHospital(incident.location);
    
    // 4. Send notifications
    await notifyEmergencyContacts(incident);
    
    // 5. Update incident with response
    await snap.ref.update({
      'response.ambulanceCalled': true,
      'response.hospitalSelected': hospital,
      'geminiAnalysis': analysis,
      'response.ambulanceCallTime': admin.firestore.FieldValue.serverTimestamp()
    });
  });
```

### **2. gemini_analyzer.js**
Analyze crash data with Vertex AI (Gemini)

```javascript
const { VertexAI } = require('@google-cloud/vertexai');

async function analyzeWithGemini(incidentData) {
  const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: 'us-central1'
  });

  const model = vertexAI.getGenerativeModel({
    model: 'gemini-pro'
  });

  const prompt = `
    Analyze this crash data and provide emergency response guidance:
    - Impact Force: ${incidentData.crashData.accelerationForce}G
    - Speed Before: ${incidentData.crashData.speedBefore}km/h
    - Audio Impact Detected: ${incidentData.crashData.audioDetected}
    
    Provide:
    1. Severity assessment
    2. Likely injury types
    3. Immediate first aid recommendations
    4. Should person stay in vehicle?
  `;

  const response = await model.generateContent(prompt);
  
  return {
    severity_assessment: response.response.text(),
    timestamp: new Date().toISOString()
  };
}
```

### **3. ambulance_router.js**
Call ambulance service (108 or private)

```javascript
exports.routeAmbulance = functions.https
  .onCall(async (data, context) => {
    if (!context.auth) throw new Error('Unauthenticated');
    
    const { location, incidentType, crashScore } = data;
    
    try {
      // Determine which service to call
      if (crashScore > 80) {
        // Call emergency services (108)
        return await callEmergencyServices(location, incidentType);
      } else {
        // Call private ambulance
        return await callPrivateAmbulance(location);
      }
    } catch (error) {
      console.error('Ambulance routing failed:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });
```

### **4. notification_sender.js**
Send notifications to emergency contacts

```javascript
exports.notifyContacts = functions.https
  .onCall(async (data, context) => {
    const { userId, incidentId, contacts, location } = data;
    
    const messaging = admin.messaging();
    
    // Send to each contact via multiple channels
    for (const contact of contacts) {
      if (contact.channels.includes('sms')) {
        await sendSMS(contact.phone, incidentId, location);
      }
      if (contact.channels.includes('call')) {
        await initiateCall(contact.phone);
      }
      if (contact.channels.includes('whatsapp')) {
        await sendWhatsApp(contact.phone, incidentId, location);
      }
    }
    
    return { success: true, notified: contacts.length };
  });
```

---

## 🚀 Deployment Guide

### **Setup GCP Project**

```bash
# 1. Create GCP project
gcloud projects create kavach-production

# 2. Enable APIs
gcloud services enable firestore.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable aiplatform.googleapis.com

# 3. Deploy Firebase
firebase init firestore --project=kavach-production
firebase init functions --project=kavach-production
firebase init hosting --project=kavach-production

# 4. Deploy Cloud Functions
cd backend/cloud_functions
firebase deploy --only functions --project=kavach-production

# 5. Deploy Firestore Rules
cd ../firestore_rules
firebase deploy --only firestore:rules --project=kavach-production
```

### **Cloud Build CI/CD Pipeline**

See `cloudbuild.yaml` for automatic deployment on git push.

```bash
gcloud builds submit --config=gcp_deployment/cloudbuild.yaml
```

---

## 📱 Mobile Integration (pubspec.yaml changes)

```yaml
firebase_core: ^2.24.0
cloud_firestore: ^4.13.0
firebase_auth: ^4.10.0
firebase_messaging: ^14.6.0
firebase_analytics: ^10.5.0
firebase_storage: ^11.6.0
google_generative_ai: ^0.1.0  # Gemini
firebase_app_distribution: ^1.0.0  # For APK distribution
```

---

## 📊 Monitoring & Analytics

- **Firebase Console**: Real-time metrics, user analytics
- **Cloud Trace**: Performance monitoring
- **Cloud Logging**: Debug logs from Cloud Functions
- **Vertex AI Monitoring**: Gemini API usage, costs

---

## 💰 Cost Optimization

- Firestore: ~$5-20/month (typical usage)
- Cloud Functions: ~$1-5/month (free tier: 2M invocations)
- Cloud Storage: ~$0.02-0.05 per GB
- Gemini API: ~$0.005 per request (adjust per your quota)

**Total**: ~$10-30/month for small-medium app

---

## 🔗 References

- Firestore: https://firebase.google.com/docs/firestore
- Cloud Functions: https://firebase.google.com/docs/functions
- Vertex AI / Gemini: https://cloud.google.com/vertex-ai/docs
- Cloud Build: https://cloud.google.com/build/docs
- Firebase App Distribution: https://firebase.google.com/docs/app-distribution
