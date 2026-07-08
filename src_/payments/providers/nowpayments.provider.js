const axios = require("axios");

const client = axios.create({
    baseURL: "https://api.nowpayments.io/v1",
    headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
    },
});

/**
 * Create a hosted invoice
 */
exports.createInvoice = async ({
    amount,
    currency = "USD",
    orderId,
    description,
    callbackUrl,
}) => {

    const payload = {
        price_amount: Number(amount),

        price_currency: currency.toLowerCase(),

        pay_currency: "usdttrc20",

        order_id: orderId,

        order_description: description,

        ipn_callback_url: callbackUrl,
    };
console.log("NOWPAYMENTS PAYLOAD:", payload);
    const { data } = await client.post(
        "/payment",
        payload
    );

    return data;
};

/**
 * Fetch invoice/payment details
 */
exports.getInvoice = async (invoiceId) => {
    const { data } = await client.get(
        `/invoice/${invoiceId}`
    );

    return data;
};

/**
 * Fetch payment details
 */
exports.getPayment = async (paymentId) => {
    const { data } = await client.get(
        `/payment/${paymentId}`
    );

    return data;
};

/**
 * Verify webhook.
 * NOWPayments signs requests using the
 * x-nowpayments-sig header.
 *
 * We'll implement this later when we
 * wire up webhooks.
 */
exports.verifyWebhook = (
    body,
    signature
) => {
    return true;
};

/**
 * Refunds are currently unsupported by
 * NOWPayments API.
 */
exports.refund = async () => {
    throw new Error(
        "NOWPayments refunds are not implemented."
    );
};

/**
 * Cancel invoice.
 * NOWPayments invoices cannot actually
 * be cancelled through the API.
 */
exports.cancelInvoice = async () => {
    return true;
};