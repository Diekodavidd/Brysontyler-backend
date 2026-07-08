const nowpayments = require("./nowpayments.provider");
const paxum = require("./paxum.provider");

/**
 * Supported payment providers.
 */
const providers = {
    nowpayments,
    paxum,
};

/**
 * Returns the requested payment provider.
 *
 * Example:
 * const provider = resolveProvider("nowpayments");
 */
exports.resolveProvider = (providerName = "nowpayments") => {

    const key = String(providerName).toLowerCase();

    const provider = providers[key];

    if (!provider) {
        throw new Error(
            `Unsupported payment provider: ${providerName}`
        );
    }

    return provider;
};

/**
 * Returns all available providers.
 */
exports.getProviders = () => {
    return Object.keys(providers);
};

/**
 * Checks if a provider exists.
 */
exports.hasProvider = (providerName) => {

    return Boolean(
        providers[String(providerName).toLowerCase()]
    );

};