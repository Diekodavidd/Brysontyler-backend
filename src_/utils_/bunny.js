const axios = require("axios");
const fs = require("fs");

const STORAGE_HOST =
  process.env.BUNNY_STORAGE_HOST || "https://storage.bunnycdn.com";

const STORAGE_ZONE =
  process.env.BUNNY_STORAGE_ZONE;

const STORAGE_PASSWORD =
  process.env.BUNNY_STORAGE_PASSWORD;

const CDN =
  process.env.BUNNY_CDN;

const uploadToBunny = async (
  filePath,
  fileName
) => {

  if (!STORAGE_ZONE) {
    throw new Error(
      "BUNNY_STORAGE_ZONE is missing"
    );
  }

  if (!STORAGE_PASSWORD) {
    throw new Error(
      "BUNNY_STORAGE_PASSWORD is missing"
    );
  }

  if (!CDN) {
    throw new Error(
      "BUNNY_CDN is missing"
    );
  }

  const uploadUrl =
    `${STORAGE_HOST}/${STORAGE_ZONE}/${fileName}`;

  console.log(
    "=========== BUNNY UPLOAD ==========="
  );

  console.log(
    "Storage Host:",
    STORAGE_HOST
  );

  console.log(
    "Storage Zone:",
    STORAGE_ZONE
  );

  console.log(
    "File Name:",
    fileName
  );

  console.log(
    "Upload URL:",
    uploadUrl
  );

  console.log(
    "Access Key Exists:",
    Boolean(STORAGE_PASSWORD)
  );

  try {

    const stream =
      fs.createReadStream(filePath);

    await axios.put(
      uploadUrl,
      stream,
      {
        headers: {
          AccessKey:
            STORAGE_PASSWORD,

          "Content-Type":
            "application/octet-stream",
        },

        maxBodyLength:
          Infinity,

        maxContentLength:
          Infinity,
      }
    );

    console.log(
      "BUNNY UPLOAD SUCCESS:",
      fileName
    );

    // Delete temp file ONLY after
    // successful Bunny upload

    if (
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(filePath);
    }

    return {
      fileUrl:
        `${CDN}/${fileName}`,

      fileName,
    };

  } catch (error) {

    console.error(
      "=========== BUNNY UPLOAD FAILED ==========="
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "Response:",
      error.response?.data
    );

    console.error(
      "Upload URL:",
      uploadUrl
    );

    throw error;
  }
};

module.exports =
  uploadToBunny;