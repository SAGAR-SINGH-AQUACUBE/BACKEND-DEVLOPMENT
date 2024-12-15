require('dotenv').config();
const twilio = require('twilio');

// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Function to send SMS
const sendSMS = (toPhoneNumber, message) => {
  client.messages
    .create({
      body: message,               // SMS content
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to: toPhoneNumber,           // Recipient's phone number
    })
    .then((message) => console.log(`Message sent: ${message.sid}`))
    .catch((error) => console.error(`Failed to send SMS: ${error}`));
};

// Example usage
const recipientPhoneNumber = '+917037147952';  // Replace with actual recipient number
const message = 'Hello! This is a test message from Twilio.';
sendSMS(recipientPhoneNumber, message);
