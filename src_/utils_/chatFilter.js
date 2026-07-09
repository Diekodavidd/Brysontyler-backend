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

    "gmail",
    "hotmail",
    "yahoo",
    "outlook",

    "paypal",
    "cashapp",
    "venmo",
    "zelle",

    "onlyfans",
    "fansly",

    "call me",
    "text me",
    "message me",
    "dm me",
    "reach me",
    "contact me",

];

const phoneRegex =
  /(\+?\d[\d\s().-]{7,}\d)/gi;

const emailRegex =
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i;

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