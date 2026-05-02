// WhatsApp Integration Service - Multi-Provider Support
// Supports: Twilio, Gupshup (FREE), Mock Mode
// Usage: whatsappService.sendInvite(phone, message)

const fetch = require('node-fetch');

// Detect which provider is configured
const PROVIDER = process.env.WHATSAPP_PROVIDER || 'twilio';

// GUPSHUP CONFIG (FREE ALTERNATIVE)
const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY || '';
const GUPSHUP_PHONE_NUMBER = process.env.GUPSHUP_PHONE_NUMBER || '';
const GUPSHUP_SOURCE_NAME = process.env.GUPSHUP_SOURCE_NAME || 'FreightFlow';

// TWILIO CONFIG
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';

let client = null;
let whatsappStatus = 'not_initialized';
let activeProvider = null;

function initializeWhatsApp() {
  console.log(`\n🔍 WhatsApp Provider Configuration:`);
  console.log(`   Configured Provider: ${PROVIDER}`);

  if (PROVIDER === 'gupshup') {
    initializeGupshup();
  } else {
    initializeTwilio();
  }
}

function initializeGupshup() {
  if (GUPSHUP_API_KEY && GUPSHUP_PHONE_NUMBER) {
    console.log('🔍 Gupshup Configuration:');
    console.log(`   API Key: ${GUPSHUP_API_KEY.substring(0, 10)}***`);
    console.log(`   Phone: ${GUPSHUP_PHONE_NUMBER}`);
    console.log(`   Source: ${GUPSHUP_SOURCE_NAME}`);
    
    whatsappStatus = 'active';
    activeProvider = 'gupshup';
    client = { isGupshup: true };
    console.log('✅ WhatsApp Service: Gupshup configured and ready');
    console.log(`   Phone: ${GUPSHUP_PHONE_NUMBER}`);
    console.log(`   💰 Tier: FREE (1000+ messages/month)`);
    return true;
  } else {
    whatsappStatus = 'mock';
    activeProvider = 'mock';
    console.log('⚠️  WhatsApp Service: Mock mode (Gupshup credentials not set)');
    return false;
  }
}

function initializeTwilio() {
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER) {
    try {
      const twilio = require('twilio');
      client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      
      console.log('🔍 Twilio Configuration:');
      console.log(`   Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 5)}***`);
      console.log(`   Auth Token: ${TWILIO_AUTH_TOKEN.substring(0, 5)}***`);
      console.log(`   WhatsApp Number: ${TWILIO_WHATSAPP_NUMBER}`);
      
      whatsappStatus = 'active';
      activeProvider = 'twilio';
      console.log('✅ WhatsApp Service: Twilio configured and ready');
      console.log(`   Phone: ${TWILIO_WHATSAPP_NUMBER}`);
      return true;
    } catch (err) {
      whatsappStatus = 'error';
      console.error('❌ Twilio initialization failed:', err.message);
      console.log('⚠️  Falling back to mock mode');
      client = null;
      return false;
    }
  } else {
    whatsappStatus = 'mock';
    activeProvider = 'mock';
    console.log('⚠️  WhatsApp Service: Mock mode (Twilio credentials not set)');
    return false;
  }
}

function getWhatsAppStatus() {
  return {
    status: whatsappStatus,
    isActive: whatsappStatus === 'active',
    provider: activeProvider || 'none',
    phone: activeProvider === 'twilio' ? TWILIO_WHATSAPP_NUMBER : 
           activeProvider === 'gupshup' ? GUPSHUP_PHONE_NUMBER : 'not configured',
    cost: activeProvider === 'gupshup' ? 'FREE' : activeProvider === 'twilio' ? 'Paid' : 'N/A'
  };
}

async function sendViaGupshup(phone, message) {
  const normalizedPhone = phone.replace(/[^0-9+]/g, '');
  
  try {
    console.log(`\n📱 ═══════════════════════════════════════════════════`);
    console.log(`   [GUPSHUP] Sending WhatsApp message`);
    console.log(`   To: ${normalizedPhone}`);
    console.log(`   Provider: Gupshup (FREE)`);
    
    const url = 'https://api.gupshup.io/wa/api/v1/msg';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${GUPSHUP_API_KEY}`
      },
      body: new URLSearchParams({
        'source': GUPSHUP_PHONE_NUMBER,
        'destination': normalizedPhone,
        'message': message,
        'messageType': 'TEXT'
      }).toString()
    });

    const data = await response.json();

    if (response.ok && (data.status === 'submitted' || data.response === 'ok')) {
      console.log(`✅ Gupshup: Message queued successfully`);
      console.log(`   ID: ${data.messageId || data.message || 'queued'}`);
      console.log(`📱 ═══════════════════════════════════════════════════\n`);
      
      return {
        status: 'sent',
        phone: normalizedPhone,
        messageId: data.messageId || 'queued',
        message: 'WhatsApp message sent via Gupshup',
        provider: 'gupshup',
        isMocked: false
      };
    } else {
      throw new Error(data.message || 'Gupshup API error');
    }
  } catch (err) {
    console.error(`\n❌ Gupshup Error:`);
    console.error(`   Message: ${err.message}`);
    console.error(`📱 ═══════════════════════════════════════════════════\n`);
    
    return {
      status: 'error',
      phone: normalizedPhone,
      error: err.message,
      provider: 'gupshup',
      isMocked: false
    };
  }
}

async function sendViaTwilio(phone, message) {
  const normalizedPhone = phone.startsWith('+') ? phone : '+' + phone;
  
  try {
    console.log(`\n📱 ═══════════════════════════════════════════════════`);
    console.log(`   [TWILIO] Sending WhatsApp message`);
    console.log(`   To: ${normalizedPhone}`);
    
    const response = await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${normalizedPhone}`,
      body: message
    });

    console.log(`✅ Twilio: Message sent successfully`);
    console.log(`   SID: ${response.sid}`);
    console.log(`   Status: ${response.status}`);
    console.log(`📱 ═══════════════════════════════════════════════════\n`);
    
    return {
      status: 'sent',
      phone: normalizedPhone,
      sid: response.sid,
      message: 'WhatsApp message sent via Twilio',
      provider: 'twilio',
      isMocked: false
    };
  } catch (err) {
    console.error(`\n❌ Twilio Error:`);
    console.error(`   Message: ${err.message}`);
    console.error(`📱 ═══════════════════════════════════════════════════\n`);
    
    return {
      status: 'error',
      phone: normalizedPhone,
      error: err.message,
      provider: 'twilio',
      isMocked: false
    };
  }
}

function sendViaMockMode(phone, message) {
  const normalizedPhone = phone.startsWith('+') ? phone : '+' + phone;
  
  console.log(`\n📱 ═══════════════════════════════════════════════════`);
  console.log(`   [MOCK MODE] WhatsApp message`);
  console.log(`   To: ${normalizedPhone}`);
  console.log(`   Message: ${message.substring(0, 100)}...`);
  console.log(`📱 ═══════════════════════════════════════════════════\n`);
  
  return {
    status: 'mock',
    phone: normalizedPhone,
    message: 'WhatsApp message (MOCK MODE - No actual delivery)',
    provider: 'mock',
    isMocked: true
  };
}

async function sendInvite(phone, message) {
  if (activeProvider === 'gupshup') {
    return await sendViaGupshup(phone, message);
  } else if (activeProvider === 'twilio' && client) {
    return await sendViaTwilio(phone, message);
  } else {
    return sendViaMockMode(phone, message);
  }
}

module.exports = { 
  sendInvite,
  initializeWhatsApp,
  getWhatsAppStatus
};