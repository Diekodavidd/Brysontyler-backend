const blockedWords = [
  "whatsapp",
  "telegram",
  "signal",
  "wechat",
  "snapchat",
  "discord",
  "imo",
  "line",
  "viber",
  "skype",

  "instagram",
  "facebook",
  "twitter",
  "x.com",
  "tiktok",

  "call me",
  "text me",
  "dm me",
  "contact me",
  "reach me",

  "gmail",
  "hotmail",
  "yahoo",
  "outlook",
];

const phoneRegex =
  /(\+?\d[\d\s().-]{7,}\d)/gi;

const emailRegex =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const urlRegex =
  /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

function containsRestrictedContent(
  text = ""
) {
  const value = text.toLowerCase();

  phoneRegex.lastIndex = 0;
  emailRegex.lastIndex = 0;
  urlRegex.lastIndex = 0;

  if (phoneRegex.test(value))
    return true;

  if (emailRegex.test(value))
    return true;

  if (urlRegex.test(value))
    return true;

  return blockedWords.some((word) =>
    value.includes(word)
  );
}

module.exports = {
  containsRestrictedContent,
};