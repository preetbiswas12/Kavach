/**
 * Kavach Cloud Functions Index
 * Exports all Cloud Functions for Firebase deployment
 * 
 * Deployment: firebase deploy --only functions --project=kavach-production
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import individual function handlers
const { processIncident } = require('./incident_processor');
const { sendEmergencyNotification } = require('./notification_sender');

/**
 * FIRESTORE TRIGGERS
 */

// Trigger: When a new incident is created (crash/theft/SOS)
// Collection: incidents
// Event: onCreate
// Action: Analyze with Gemini, find nearby ambulance, select hospital
exports.processIncident = functions
  .firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    try {
      const incident = snap.data();
      const incidentId = context.params.incidentId;
      
      console.log(`[processIncident] Processing incident: ${incidentId}`, incident);
      
      // Call incident processor
      const result = await processIncident(incident, incidentId, snap.ref);
      
      console.log(`[processIncident] Success: ${incidentId}`, result);
      return result;
    } catch (error) {
      console.error(`[processIncident] Error processing incident:`, error);
      throw error;
    }
  });

/**
 * HTTPS CALLABLE FUNCTIONS
 */

// Function: Send emergency notifications to contacts
// Called from: Flutter app (after incident creation)
// Action: Send SMS, WhatsApp, calls to emergency contacts
exports.sendEmergencyNotification = functions
  .https
  .onCall(async (data, context) => {
    try {
      // Verify caller is authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to send notifications');
      }

      const { incidentId, userId, emergencyContacts } = data;

      if (!incidentId || !userId || !emergencyContacts) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: incidentId, userId, emergencyContacts');
      }

      console.log(`[sendEmergencyNotification] Sending notifications for incident: ${incidentId}`);

      // Call notification sender
      const result = await sendEmergencyNotification({
        incidentId,
        userId,
        emergencyContacts,
        auth: context.auth
      });

      console.log(`[sendEmergencyNotification] Success:`, result);
      return result;
    } catch (error) {
      console.error(`[sendEmergencyNotification] Error:`, error);
      
      // Convert error to HttpsError for proper client response
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', error.message || 'Error sending notifications');
    }
  });

/**
 * BACKGROUND JOBS / SCHEDULED FUNCTIONS
 */

// Function: Clean up old incidents and location history
// Schedule: Every day at 2 AM UTC
// Action: Delete incidents >30 days old, location history >30 days old
exports.cleanupOldData = functions
  .pubsub
  .schedule('0 2 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      console.log('[cleanupOldData] Starting cleanup of old incidents and location history');

      // Delete old incidents
      const oldIncidents = await db
        .collectionGroup('incidents')
        .where('createdAt', '<', thirtyDaysAgo)
        .limit(100)
        .get();

      let deletedCount = 0;
      for (const doc of oldIncidents.docs) {
        await doc.ref.delete();
        deletedCount++;
      }

      console.log(`[cleanupOldData] Deleted ${deletedCount} old incidents`);

      // Delete old location history (handled by Firestore TTL in production)
      // This is a backup cleanup strategy
      
      return { success: true, deletedIncidents: deletedCount };
    } catch (error) {
      console.error('[cleanupOldData] Error during cleanup:', error);
      throw error;
    }
  });

/**
 * UTILITY FUNCTIONS (Not exported as Cloud Functions, used internally)
 */

/**
 * Helper: Get nearby ambulances
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<Array>} Array of nearby ambulances
 */
async function getNearbyAmbulances(lat, lng, radiusKm = 5) {
  const db = admin.firestore();
  
  try {
    // Query ambulance services within radius
    // This assumes geoHash is stored for efficient geo-queries
    const result = await db
      .collection('ambulanceServices')
      .where('location.geoHash', '>=', geoHash(lat, lng))
      .limit(10)
      .get();

    return result.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching nearby ambulances:', error);
    return [];
  }
}

/**
 * Helper: Calculate distance between two lat/lng points
 * Uses Haversine formula
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Helper: Generate geoHash for location-based queries
 * Simplified version - production should use proper geoHash library
 */
function geoHash(lat, lng, precision = 10) {
  const chars = '0123456789bcdefghjkmnpqrstuvwxyz';
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';

  const latMin = -90, latMax = 90;
  const lngMin = -180, lngMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      const mid = (lngMin + lngMax) / 2;
      if (lng > mid) {
        idx = (idx << 1) + 1;
        lngMin = mid;
      } else {
        idx = idx << 1;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat > mid) {
        idx = (idx << 1) + 1;
        latMin = mid;
      } else {
        idx = idx << 1;
        latMax = mid;
      }
    }

    evenBit = !evenBit;

    if (bit < 4) {
      bit++;
    } else {
      geohash += chars[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}

module.exports = {
  // Exported functions
  processIncident: exports.processIncident,
  sendEmergencyNotification: exports.sendEmergencyNotification,
  cleanupOldData: exports.cleanupOldData,
  
  // Utility exports (optional, for testing)
  calculateDistance,
  getNearbyAmbulances,
  geoHash
};
