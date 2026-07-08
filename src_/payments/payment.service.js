const Payment = require("../models_/payment");
const User = require("../models_/user");
const Subscription = require("../models_/subscription");

const {
    resolveProvider,
} = require("./providers/provider.factory");

/**
 * Creates and stores a payment record.
 */
const createPaymentRecord = async ({
    userId,

    creatorId = null,

    paymentType,

    membershipPlan = null,

    amount,

    currency = "USD",

    provider,

    orderId,

    invoice,

    walletAmount = 0,

    coinPurchase = null,

    description = "",
}) => {

    const payment = await Payment.create({

        userId,

        creatorId,

        paymentType,

        membershipPlan,

        amount,

        currency,

        paymentProvider: provider,

        orderId,

       paymentId:
    invoice.payment_id ||
    invoice.id ||
    null,

invoiceId:
    invoice.payment_id ||
    invoice.id ||
    null,

invoiceUrl:
    invoice.invoice_url ||
    invoice.checkout_url ||
    invoice.payment_url ||
    null,

payAddress:
    invoice.pay_address || null,

payAmount:
    invoice.pay_amount || null,

payCurrency:
    invoice.pay_currency || null,

network:
    invoice.network || null,

validUntil:
    invoice.valid_until || null,

paymentStatus:
    invoice.payment_status || "waiting",
        walletAmount,

        coinPurchase,

        orderDescription:
            description,

    });

    return payment;
};

/**
 * Generates a unique order ID.
 */
const generateOrderId = (
    type,
    userId
) => {

    return `${type}_${userId}_${Date.now()}`;

};

/**
 * Creates a checkout/invoice
 * using the selected provider.
 */
const createInvoice = async ({

    providerName,

    amount,

    currency = "USD",

    orderId,

    description,

}) => {

    const provider =
        resolveProvider(providerName);

   return provider.createInvoice({

    amount,

    currency,

    orderId,

    description,

    callbackUrl:
        `${process.env.BACKEND_URL}/payments/webhook/${providerName}`,

});

};

/**
 * Creates a membership payment.
 */
const createMembershipPayment = async ({
    user,
    plan,
    providerName = "nowpayments",
}) => {

    const plans = {
        VIP: 14.99,
        ELITE: 29.99,
    };

    const amount = plans[plan];

    if (!amount) {
        throw new Error("Invalid membership plan.");
    }

    const orderId = generateOrderId(
        "membership",
        user._id
    );

    const invoice = await createInvoice({

        providerName,

        amount,

        currency: "USD",

        orderId,

        description: `${plan} Membership`,

    });

    const payment =
        await createPaymentRecord({

            userId: user._id,

            paymentType: "membership",

            membershipPlan: plan,

            amount,

            currency: "USD",

            provider: providerName,

            orderId,

            invoice,

            description:
                `${plan} Membership`,
        });

    return {
        payment,
        invoice,
    };

};

/**
 * Creates a creator subscription payment.
 */
const createSubscriptionPayment = async ({
    user,
    creatorId,
    providerName = "nowpayments",
}) => {

    const creator =
        await User.findById(creatorId);

    if (!creator) {
        throw new Error("Creator not found.");
    }

    if (creator.role !== "creator") {
        throw new Error("Invalid creator.");
    }

    const amount =
        creator.subscriptionPrice || 9.99;

    const orderId = generateOrderId(
        "subscription",
        user._id
    );

    const invoice = await createInvoice({

        providerName,

        amount,

        currency: "USD",

        orderId,

        description:
            `Subscription to ${creator.stageName || creator.name}`,

    });

    const payment =
        await createPaymentRecord({

            userId: user._id,

            creatorId,

            paymentType: "subscription",

            amount,

            currency: "USD",

            provider: providerName,

            orderId,

            invoice,

            description:
                `Subscription to ${creator.stageName || creator.name}`,
        });

    return {

        payment,

        invoice,

    };

};

/**
 * Creates a wallet deposit payment.
 */
const depositWallet = async ({
    user,
    amount,
    providerName = "nowpayments",
}) => {


    console.log("SERVICE AMOUNT:", amount);
    console.log("SERVICE TYPE:", typeof amount);


    amount = Number(amount);

    if (amount <= 0) {
        throw new Error("Invalid amount.");
    }

    const orderId = generateOrderId(
        "wallet",
        user._id
    );

    const invoice = await createInvoice({

        providerName,

        amount,

        currency: "USD",

        orderId,

        description:
            "Wallet Deposit",

    });

    const payment =
        await createPaymentRecord({

            userId: user._id,

            paymentType: "wallet",

            amount,

            walletAmount: amount,

            provider: providerName,

            orderId,

            invoice,

            description:
                "Wallet Deposit",

        });

    return {

        payment,

        invoice,

    };

};

/**
 * Creates a coin purchase payment.
 */
const buyCoins = async ({
    user,
    coinType,
    quantity,
    providerName = "nowpayments",
}) => {

    const prices = {
        gold: 5,
        silver: 2,
        ruby: 1,
    };

    if (!prices[coinType]) {
        throw new Error("Invalid coin type.");
    }

    quantity = Number(quantity);

    const amount =
        prices[coinType] * quantity;

    const orderId = generateOrderId(
        "coins",
        user._id
    );

    const invoice = await createInvoice({

        providerName,

        amount,

        currency: "USD",

        orderId,

        description:
            `${quantity} ${coinType} coins`,

    });

    const payment =
        await createPaymentRecord({

            userId: user._id,

            paymentType: "coins",

            amount,

            provider: providerName,

            orderId,

            invoice,

            description:
                `${quantity} ${coinType} coins`,

            coinPurchase: {

                coinType,

                quantity,

                pricePerCoin:
                    prices[coinType],

            },

        });

    return {

        payment,

        invoice,

    };

};

/**
 * Completes a successful payment.
 *
 * This method is provider-agnostic.
 * It simply applies the payment effects
 * to the user's account.
 */
const completePayment = async (payment) => {

    if (!payment) {
        throw new Error("Payment not found.");
    }

    if (payment.completed) {
        return payment;
    }

    const user = await User.findById(
        payment.userId
    );

    if (!user) {
        throw new Error("User not found.");
    }

    switch (payment.paymentType) {

        /*
        ==========================
        WALLET
        ==========================
        */

        case "wallet":

            user.walletBalance +=
                payment.walletAmount;

            break;



        /*
        ==========================
        COINS
        ==========================
        */

        case "coins":

            if (
                !user.coinBalances[
                    payment.coinPurchase.coinType
                ]
            ) {

                user.coinBalances[
                    payment.coinPurchase.coinType
                ] = 0;

            }

            user.coinBalances[
                payment.coinPurchase.coinType
            ] +=
                payment.coinPurchase.quantity;

            break;



        /*
        ==========================
        MEMBERSHIP
        ==========================
        */

        case "membership":

            user.membership = {

                plan:
                    payment.membershipPlan,

                status:
                    "active",

                startDate:
                    new Date(),

                endDate:
                    new Date(
                        Date.now() +
                        30 *
                        24 *
                        60 *
                        60 *
                        1000
                    ),

            };

            break;



        /*
        ==========================
        CREATOR SUBSCRIPTION
        ==========================
        */

        case "subscription": {

            let sub =
                await Subscription.findOne({

                    fanId:
                        payment.userId,

                    creatorId:
                        payment.creatorId,

                });

            if (sub) {

                sub.status =
                    "active";

                sub.amount =
                    payment.amount;

                sub.startDate =
                    new Date();

                sub.endDate =
                    new Date(
                        Date.now() +
                        30 *
                        24 *
                        60 *
                        60 *
                        1000
                    );

                await sub.save();

            } else {

                await Subscription.create({

                    fanId:
                        payment.userId,

                    creatorId:
                        payment.creatorId,

                    amount:
                        payment.amount,

                    status:
                        "active",

                    startDate:
                        new Date(),

                    endDate:
                        new Date(
                            Date.now() +
                            30 *
                            24 *
                            60 *
                            60 *
                            1000
                        ),

                });

            }

            break;

        }



        /*
        ==========================
        TIP
        ==========================
        */

        case "tip":

            // We'll implement tipping later.

            break;



        default:

            throw new Error(
                `Unsupported payment type: ${payment.paymentType}`
            );

    }



    /*
    ==========================
    FINALIZE PAYMENT
    ==========================
    */

    payment.completed = true;

    payment.paymentStatus = "finished";

    await payment.save();

    await user.save();

    return payment;

};

module.exports = {

    createMembershipPayment,

    createSubscriptionPayment,

    depositWallet,

    buyCoins,

    completePayment,

};