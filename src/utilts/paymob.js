import { AppError } from "../errorHandling/AppError.js";
import crypto from 'crypto';

const PAYMOB_API_URL = "https://accept.paymob.com/api";

export const authenticate = async () => {
    try {
        const response = await fetch(`${PAYMOB_API_URL}/auth/tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: process.env.PAYMOB_API_KEY,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Paymob Authentication Failed");
        }
        return data.token;
    } catch (error) {
        throw new AppError(`Paymob Auth Error: ${error.message}`, 500);
    }
};

export const registerOrder = async (authToken, amountCents, currency, items, merchantOrderId) => {
    try {
        const response = await fetch(`${PAYMOB_API_URL}/ecommerce/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                auth_token: authToken,
                delivery_needed: "false",
                amount_cents: amountCents,
                currency: currency,
                merchant_order_id: merchantOrderId,
                items: items,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Paymob Order Registration Failed");
        }
        return data.id;
    } catch (error) {
        throw new AppError(`Paymob Order Error: ${error.message}`, 500);
    }
};

export const requestPaymentKey = async (authToken, orderId, amountCents, currency, billingData, integrationId) => {
    try {
        const response = await fetch(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                auth_token: authToken,
                amount_cents: amountCents,
                expiration: 3600,
                order_id: orderId,
                billing_data: billingData,
                currency: currency,
                integration_id: integrationId,
                lock_order_when_paid: "false"
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Paymob Payment Key Request Failed");
        }
        return data.token;
    } catch (error) {
        throw new AppError(`Paymob Key Error: ${error.message}`, 500);
    }
};

export const validateHmac = (data, hmacSecret) => {
    // Extract values handling both flat (query) and nested (obj) structures
    const getValue = (key, nestedKey) => {
        if (data[key] !== undefined) return data[key];
        // Handle nested extraction if necessary, but Paymob HMAC keys are specific
        return "";
    };

    // Helper to get nested property safely
    const getNested = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const amount_cents = data.amount_cents;
    const created_at = data.created_at;
    const currency = data.currency;
    const error_occured = data.error_occured;
    const has_parent_transaction = data.has_parent_transaction;
    const id = data.id;
    const integration_id = data.integration_id;
    const is_3d_secure = data.is_3d_secure;
    const is_auth = data.is_auth;
    const is_capture = data.is_capture;
    const is_refunded = data.is_refunded;
    const is_standalone_payment = data.is_standalone_payment;
    const is_voided = data.is_voided;

    // 'order' key in HMAC is the order ID. 
    // In webhook 'obj', it's obj.order.id. In GET callback, it's query.order
    let orderId = data.order;
    if (typeof data.order === 'object' && data.order.id) {
        orderId = data.order.id;
    }

    const owner = data.owner;
    const pending = data.pending;

    // source_data.pan
    let source_data_pan = data.source_data_pan;
    if (!source_data_pan && data.source_data) source_data_pan = data.source_data.pan;

    // source_data.sub_type
    let source_data_sub_type = data.source_data_sub_type;
    if (!source_data_sub_type && data.source_data) source_data_sub_type = data.source_data.sub_type;

    // source_data.type
    let source_data_type = data.source_data_type;
    if (!source_data_type && data.source_data) source_data_type = data.source_data.type;

    const success = data.success;

    const concatenatedString =
        (amount_cents ?? "") +
        (created_at ?? "") +
        (currency ?? "") +
        (error_occured ?? "") +
        (has_parent_transaction ?? "") +
        (id ?? "") +
        (integration_id ?? "") +
        (is_3d_secure ?? "") +
        (is_auth ?? "") +
        (is_capture ?? "") +
        (is_refunded ?? "") +
        (is_standalone_payment ?? "") +
        (is_voided ?? "") +
        (orderId ?? "") +
        (owner ?? "") +
        (pending ?? "") +
        (source_data_pan ?? "") +
        (source_data_sub_type ?? "") +
        (source_data_type ?? "") +
        (success ?? "");

    const calculatedHmac = crypto
        .createHmac("sha512", hmacSecret)
        .update(concatenatedString)
        .digest("hex");

    return calculatedHmac === data.hmac;
};
