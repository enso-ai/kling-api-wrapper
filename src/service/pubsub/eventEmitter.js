// eventEmitter.js

// Imports the Google Cloud client library
import { PubSub } from '@google-cloud/pubsub';

// --- Configuration (can be moved to environment variables) ---
const projectId = 'pure-lantern-394915'; 
const topicName = 'playground-events';

// --- Singleton Pub/Sub Client ---
// Creates a client; caches it for further use.
const pubSubClient = new PubSub({ projectId });

/**
 * Publishes a custom event to the Pub/Sub topic.
 * @param {string} event_name - The name of the event (e.g., 'user_login').
 * @param {string} user_id - The ID of the user associated with the event.
 * @param {object} params - A JavaScript object containing event-specific parameters. This will be stringified.
 */
export async function emitMessage(event_name, user_id, params) {
  try {
    // --- Construct the Event Data ---
    const eventData = {
      event_name, // from function parameter
      user_id,    // from function parameter
      // The 'params' field is stringified to be compatible with BigQuery's JSON type.
      params: JSON.stringify(params), // from function parameter
      // The 'created' timestamp is generated automatically.
      created: new Date().toISOString(),
    };

    // Pub/Sub messages must be sent as a Buffer.
    const dataBuffer = Buffer.from(JSON.stringify(eventData));

    // Publishes the message
    const messageId = await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
    console.log(`Message ${messageId} published for event: ${event_name}`);
    return messageId; // Return the ID on success
  } catch (error) {
    console.error(`[emitMessage] Error publishing event "${event_name}": ${error.message}`);
    // Re-throw or handle the error as needed by the calling application.
    throw error;
  }
}