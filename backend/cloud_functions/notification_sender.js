const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function: Send Notifications
 * Sends emergency alerts via multiple channels
 */
exports.sendEmergencyNotification = functions
  .region('asia-south1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { userId, incidentId, contacts, location, hospital } = data;

      if (context.auth.uid !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Cannot notify for other users');
      }

      const notificationPromises = [];

      for (const contact of contacts) {
        if (contact.channels.includes('sms')) {
          notificationPromises.push(sendSMS(contact, incidentId, location, hospital));
        }
        if (contact.channels.includes('whatsapp')) {
          notificationPromises.push(sendWhatsApp(contact, incidentId, location, hospital));
        }
        if (contact.channels.includes('call')) {
          notificationPromises.push(initiateCall(contact, userId));
        }
      }

      const results = await Promise.allSettled(notificationPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;

      console.log(`[Notifications] Sent to ${successful}/${contacts.length} contacts`);

      return {
        success: true,
        notified: successful,
        total: contacts.length
      };
    } catch (error) {
      console.error('Notification sending failed:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * Send SMS notification
 * TODO: Replace with Twilio integration
 */
async function sendSMS(contact, incidentId, location, hospital) {
  const message = `EMERGENCY: Crash detected. Ambulance dispatched to ${hospital.name}. 
Track: https://kavach.app/track/${incidentId}`;

  console.log(`[SMS] → ${contact.phone}: ${message}`);
  // TODO: Integrate with Twilio
  return true;
}

/**
 * Send WhatsApp notification
 * TODO: Replace with WhatsApp Business API integration
 */
async function sendWhatsApp(contact, incidentId, location, hospital) {
  const message = `🚨 EMERGENCY ALERT 🚨\nCrash detected near you!\n📍 Location: ${location.address}\n🏥 Hospital: ${hospital.name}\n⏱️ Ambulance ETA: ~${hospital.distanceFromLocation} min\n\nTrack in real-time: https://kavach.app/track/${incidentId}`;

  console.log(`[WhatsApp] → ${contact.phone}`);
  // TODO: Integrate with WhatsApp Business API
  return true;
}

/**
 * Initiate voice call
 * TODO: Replace with Twilio Voice API integration
 */
async function initiateCall(contact, userId) {
  console.log(`[Call] Attempting to call ${contact.phone}`);
  // TODO: Integrate with Twilio Voice
  return true;
}

module.exports = { sendEmergencyNotification };
