const blockedWords = [
    "whatsapp",
    "telegram",
    "signal",
    "snapchat",
    "discord",
    "wechat",
    "line",
    "imo",
    "phone number",
    "call me",
    "text me",
    "message me",
    "dm me",
    "contact me",
    "reach me",
];

const phoneRegex =
/(\+?\d[\d\s\-()]{7,}\d)/gi;

const emailRegex =
/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const urlRegex =
/https?:\/\/\S+|www\.\S+/gi;

const socialRegex =
/@[a-zA-Z0-9_.]{3,30}/g;

function filterMessage(text) {
    if (!text) return text;

    let cleaned = text;

    cleaned = cleaned.replace(
        phoneRegex,
        "[Phone Number Removed]"
    );

    cleaned = cleaned.replace(
        emailRegex,
        "[Email Removed]"
    );

    cleaned = cleaned.replace(
        urlRegex,
        "[Link Removed]"
    );

    cleaned = cleaned.replace(
        socialRegex,
        "[Username Removed]"
    );

    blockedWords.forEach(word => {
        const regex = new RegExp(word, "gi");

        cleaned = cleaned.replace(
            regex,
            "[Blocked]"
        );
    });

    return cleaned;
}

module.exports = filterMessage;