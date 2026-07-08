const axios = require("axios");

const client = axios.create({
    baseURL: process.env.PAXUM_API_URL || "https://api.paxum.com",
    headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.PAXUM_API_KEY,
        "X-API-SECRET": process.env.PAXUM_API_SECRET,
    },
});

/**
 * Creates a payment session / hosted checkout.
 *
 * NOTE:
 * This is intentionally a placeholder until
 * we confirm the exact Paxum endpoint.
 */
exports.createInvoice = async ({
    amount,
    currency = "USD",
    orderId,
    description,
    callbackUrl,
    successUrl,
    cancelUrl,
}) => {

    const payload = {
        amount: Number(amount),
        currency,

        orderId,

        description,

        callbackUrl,

        successUrl,

        cancelUrl,
    };

    /**
     * TODO:
     *
     * Replace "/checkout"
     * with Paxum's real endpoint.
     */
    const { data } = await client.post(
        "/checkout",
        payload
    );

    return data;
};

/**
 * Retrieve payment details.
 *
 * Placeholder until Paxum docs
 * confirm the endpoint.
 */
exports.getInvoice = async (invoiceId) => {

    const { data } = await client.get(
        `/payments/${invoiceId}`
    );

    return data;
};

/**
 * Alias for consistency with
 * other providers.
 */
exports.getPayment = async (paymentId) => {

    const { data } = await client.get(
        `/payments/${paymentId}`
    );

    return data;
};

/**
 * Cancel payment.
 *
 * Placeholder.
 */
exports.cancelInvoice = async (paymentId) => {

    const { data } = await client.post(
        `/payments/${paymentId}/cancel`
    );

    return data;
};

/**
 * Refund payment.
 *
 * Placeholder.
 */
exports.refund = async ({
    paymentId,
    amount,
}) => {

    const { data } = await client.post(
        `/payments/${paymentId}/refund`,
        {
            amount,
        }
    );

    return data;
};

/**
 * Verify webhook signature.
 *
 * We'll replace this once
 * Paxum's signing algorithm
 * is confirmed.
 */
exports.verifyWebhook = (
    body,
    signature
) => {

    return true;

};