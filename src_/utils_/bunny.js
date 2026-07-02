const axios = require("axios");
const fs = require("fs");

const STORAGE_HOST = process.env.BUNNY_STORAGE_HOST;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD;

const uploadToBunny = async (
    filePath,
    fileName
) => {

    const stream = fs.createReadStream(filePath);

    const url =
        `${STORAGE_HOST}/${STORAGE_ZONE}/${fileName}`;

    await axios.put(
        url,
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
        fileUrl: `${STORAGE_HOST}/${STORAGE_ZONE}/${fileName}`,
        fileName,
    };
};

module.exports = uploadToBunny;