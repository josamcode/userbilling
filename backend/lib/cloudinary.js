const cloudinary = require("cloudinary").v2;

let configured = false;

function ensureConfigured() {
  if (configured) return cloudinary;
  const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
  } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are not configured");
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  return cloudinary;
}

function uploadBuffer(buffer, options = {}) {
  const c = ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = c.uploader.upload_stream(
      { folder: "userbilling/users", resource_type: "image", ...options },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

async function destroyImage(publicId) {
  if (!publicId) return null;
  const c = ensureConfigured();
  try {
    return await c.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    return null;
  }
}

module.exports = { uploadBuffer, destroyImage };
