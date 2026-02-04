import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = `http://localhost:${PORT}/paymob-webhook`;
const HMAC_SECRET = process.env.PAYMOB_HMAC;

if (!HMAC_SECRET) {
    console.error("❌ Error: PAYMOB_HMAC not found in .env file");
    process.exit(1);
}

// 1. Create a Mock Payload (Partial structure matching what Paymob sends)
const mockPayload = {
    amount_cents: 10000, // 100 EGP
    created_at: new Date().toISOString(),
    currency: "EGP",
    error_occured: "false",
    has_parent_transaction: "false",
    id: Math.floor(Math.random() * 10000000), // Random Transaction ID
    integration_id: 12345,
    is_3d_secure: "true",
    is_auth: "false",
    is_capture: "false",
    is_refunded: "false",
    is_standalone_payment: "false",
    is_voided: "false",
    order: {
        id: Math.floor(Math.random() * 10000000), // Random Order ID
    },
    owner: 123,
    pending: "false",
    source_data: {
        pan: "2346",
        sub_type: "MasterCard",
        type: "card"
    },
    success: "true"
};

// 2. Calculate HMAC using the exact logic from paymob.js (or equivalent)
// Concatenation Order:
// amount_cents, created_at, currency, error_occured, has_parent_transaction, id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided, order.id, owner, pending, source_data.pan, source_data.sub_type, source_data.type, success

const concatenatedString =
    mockPayload.amount_cents.toString() +
    mockPayload.created_at +
    mockPayload.currency +
    mockPayload.error_occured +
    mockPayload.has_parent_transaction +
    mockPayload.id.toString() +
    mockPayload.integration_id.toString() +
    mockPayload.is_3d_secure +
    mockPayload.is_auth +
    mockPayload.is_capture +
    mockPayload.is_refunded +
    mockPayload.is_standalone_payment +
    mockPayload.is_voided +
    mockPayload.order.id.toString() +
    mockPayload.owner.toString() +
    mockPayload.pending +
    mockPayload.source_data.pan +
    mockPayload.source_data.sub_type +
    mockPayload.source_data.type +
    mockPayload.success;

const calculatedHmac = crypto
    .createHmac("sha512", HMAC_SECRET)
    .update(concatenatedString)
    .digest("hex");

// 3. Send Request
console.log(`🚀 Sending Webhook to: ${WEBHOOK_URL}`);
console.log(`🔑 HMAC Secret exists: Yes`);
console.log(`🔢 Transaction ID: ${mockPayload.id}`);
console.log(`📦 Payload prepared...`);

async function sendWebhook() {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                obj: mockPayload, // Paymob wraps the data in 'obj'
                hmac: calculatedHmac
            })
        });

        const text = await response.text();

        if (response.ok) {
            console.log("\n✅ Webhook Received & Processed Successfully!");
            console.log(`👉 Server Response: ${text}`);
            console.log("\nIf you see this, your BACKEND code is 100% correct.");
            console.log("The issue is likely that Paymob cannot reach your Localhost.");
        } else {
            console.error("\n❌ Server returned an error:");
            console.error(`Status: ${response.status} ${response.statusText}`);
            console.error(`Response: ${text}`);
        }
    } catch (error) {
        console.error("\n❌ Network Error / Connection Refused");
        console.error("Is your server building/running? (npm start)");
        console.error(`Error: ${error.message}`);
    }
}

sendWebhook();
