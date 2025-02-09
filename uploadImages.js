const { v2: cloudinary } = require("cloudinary");
const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();

// 📌 Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📂 Dossier contenant les JSON
const dataDir = path.join(process.cwd(), "data");

// 🛠 Fonction pour uploader un fichier JSON sur Cloudinary
async function uploadJSONToCloudinary(fileName) {
  try {
    const filePath = path.join(dataDir, fileName);
    const fileData = await fs.readFile(filePath, "utf-8");

    // 🔹 Crée un fichier temporaire dans le dossier temp/
    const tempDir = path.join(process.cwd(), "temp");
    await fs.mkdir(tempDir, { recursive: true }); // Assure que le dossier existe

    const tempFilePath = path.join(tempDir, fileName);
    await fs.writeFile(tempFilePath, fileData, "utf-8");

    // 🔥 Upload du fichier JSON depuis le chemin réel
    const result = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "raw", // Fichier brut
      folder: "tabac/json",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    console.log(`✅ ${fileName} uploadé avec succès :`, result.secure_url);

    // 🗑 Supprime le fichier temporaire après upload
    await fs.unlink(tempFilePath);

    return result.secure_url;
  } catch (error) {
    console.error(`❌ Erreur lors de l’upload de ${fileName} :`, error);
    return null;
  }
}

// 🚀 Uploader tous les fichiers JSON
async function uploadAllJSONFiles() {
  const files = ["news.json", "openingHours.json", "services.json"];
  const urls = {};

  for (const file of files) {
    const url = await uploadJSONToCloudinary(file);
    if (url) {
      urls[file] = url;
    }
  }

  console.log("🌐 URLs des fichiers JSON :", urls);
}

uploadAllJSONFiles();
