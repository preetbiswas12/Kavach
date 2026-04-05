const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');

admin.initializeApp();

/**
 * Cloud Function: Process Incident
 * Triggers when a new crash incident is detected
 * - Analyzes with Gemini
 * - Finds ambulance
 * - Selects hospital
 * - Notifies contacts
 */
exports.processIncident = functions
  .region('asia-south1')
  .firestore.document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    const incident = snap.data();
    console.log(`[Incident Processor] Processing incident: ${context.params.incidentId}`);

    try {
      // 1. Analyze with Gemini
      const geminiAnalysis = await analyzeWithGemini(incident);
      console.log(`[Gemini] Analysis complete:`, geminiAnalysis);

      // 2. Find nearest ambulance
      const ambulance = await findNearbyAmbulance(
        incident.location.latitude,
        incident.location.longitude
      );
      console.log(`[Ambulance] Found:`, ambulance);

      // 3. Select optimal hospital
      const hospital = await selectOptimalHospital(
        incident.location.latitude,
        incident.location.longitude,
        incident.crashData.crashScore
      );
      console.log(`[Hospital] Selected:`, hospital.name);

      // 4. Update incident with response
      await snap.ref.update({
        'response.ambulanceCalled': true,
        'response.ambulanceETA': ambulance.eta,
        'response.hospitalSelected': hospital,
        'geminiAnalysis': geminiAnalysis,
        'response.ambulanceCallTime': admin.firestore.FieldValue.serverTimestamp(),
        'status': 'ambulance_dispatched'
      });

      // 5. Get user and notify emergency contacts
      const userDoc = await admin.firestore().collection('users').doc(incident.userId).get();
      const user = userDoc.data();

      if (user && user.emergencyContacts) {
        await notifyEmergencyContacts(user, incident, hospital);
      }

      console.log(`[Incident Processor] Incident processing complete`);
      return { success: true, incidentId: context.params.incidentId };
    } catch (error) {
      console.error(`[Error] Incident processing failed:`, error);
      await snap.ref.update({
        'status': 'error',
        'errorMessage': error.message
      });
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * Analyze crash data with Vertex AI Gemini
 */
async function analyzeWithGemini(incident) {
  try {
    const vertexAI = new VertexAI({
      project: process.env.GCP_PROJECT_ID || 'kavach-production',
      location: 'us-central1'
    });

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-pro'
    });

    const crashData = incident.crashData;
    const prompt = `
You are an emergency medical AI assistant. Analyze this vehicle crash and provide critical guidance:

CRASH DATA:
- Impact Force: ${crashData.accelerationForce}G (0-100 scale)
- Speed Before Impact: ${crashData.speedBefore} km/h
- Speed After Impact: ${crashData.speedAfter} km/h
- Impact Direction: ${crashData.direction}
- Audio Impact Detected: ${crashData.audioDetected ? 'YES' : 'NO'}
- Crash Score: ${crashData.crashScore}/100

PROVIDE IN JSON FORMAT:
{
  "severity_assessment": "CRITICAL|HIGH|MEDIUM|LOW",
  "injury_risk": "Likely injuries based on impact",
  "first_aid": "Immediate steps to take",
  "stay_in_vehicle": true/false,
  "emergency_contact": "e.g., Call 108 immediately",
  "hospital_type_needed": "trauma_center|general|specialist",
  "risk_factors": ["list of risks"]
}

Be concise and actionable. Lives depend on this.`;

    const response = await model.generateContent(prompt);
    const text = response.response.candidates[0].content.parts[0].text;
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };

    return {
      ...analysis,
      timestamp: new Date().toISOString(),
      model: 'gemini-pro'
    };
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return {
      severity_assessment: 'CRITICAL',
      injury_risk: 'Unknown - assume high risk',
      first_aid: 'Call emergency services immediately',
      stay_in_vehicle: false,
      error: error.message
    };
  }
}

/**
 * Find nearby ambulance (mock - replace with real ambulance API)
 */
async function findNearbyAmbulance(latitude, longitude) {
  // TODO: Connect to actual ambulance service API (108, Uber, etc.)
  return {
    id: 'ambulance-001',
    name: '108 Emergency',
    eta: 5,
    distance: 2.3,
    phone: '+919999999999',
    location: {
      latitude: latitude + 0.01,
      longitude: longitude + 0.01
    }
  };
}

/**
 * Select optimal hospital based on location, traffic, availability
 */
async function selectOptimalHospital(latitude, longitude, crashScore) {
  // Query nearby hospitals from Firestore
  const hospitalsSnapshot = await admin
    .firestore()
    .collection('hospitals')
    .where('type', '==', crashScore > 70 ? 'trauma_center' : 'general')
    .get();

  if (hospitalsSnapshot.empty) {
    throw new Error('No hospitals found');
  }

  // TODO: Calculate distance using Google Maps API
  // For now, return closest by location
  const hospitals = hospitalsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Sort by distance (mock)
  return hospitals[0];
}

/**
 * Notify emergency contacts via SMS, Call, WhatsApp
 */
async function notifyEmergencyContacts(user, incident, hospital) {
  const contacts = user.emergencyContacts || [];

  for (const contact of contacts) {
    console.log(`[Notification] Sending to ${contact.name} (${contact.phone})`);

    const message = `EMERGENCY ALERT: ${user.name} was in a crash at ${incident.location.address}. 
Ambulance dispatched. Hospital: ${hospital.name}. 
Track: https://kavach.app/track/${incident.id}`;

    // TODO: Integrate with Twilio for SMS/Call
    // TODO: Integrate with WhatsApp Business API
    // For now, log
    console.log(`Message: ${message}`);
  }
}

module.exports = { processIncident };
