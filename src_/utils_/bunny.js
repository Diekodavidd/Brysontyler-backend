const axios = require("axios");
const fs = require("fs");

const STORAGE_HOST = process.env.BUNNY_STORAGE_HOST;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD;

const CDN = process.env.BUNNY_CDN;

const uploadToBunny = async (filePath, fileName) => {

    const stream = fs.createReadStream(filePath);

    await axios.put(
        `${STORAGE_HOST}/${STORAGE_ZONE}/${fileName}`,
        stream,
        {
            headers: {
                AccessKey: STORAGE_PASSWORD,
                "Content-Type": "application/octet-stream",
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        }
    );

    fs.unlinkSync(filePath);

    return {
        fileUrl: `${CDN}/${fileName}`,
        fileName,
    };
};

module.exports = uploadToBunny;