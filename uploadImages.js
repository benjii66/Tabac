const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Charge les variables d'environnement

// Configure Cloudinary avec les bonnes clés
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const folderPath = "public/assets/images"; // Dossier contenant les images

// Vérifie que le dossier existe
if (!fs.existsSync(folderPath)) {
  console.error("Le dossier public/assets/images n'existe pas !");
  process.exit(1);
}

// Récupère tous les fichiers et les upload correctement dans "tabac/"
fs.readdirSync(folderPath).forEach((file) => {
  const filePath = path.join(folderPath, file);
  const publicId = `tabac/${path.parse(file).name}`; // 🔥 Corrige le chemin

  cloudinary.uploader
    .upload(filePath, {
      public_id: publicId, // 🔥 On garde uniquement ça
      use_filename: true,
      unique_filename: false, // Évite d'ajouter un suffixe aléatoire
      overwrite: true, // Permet de réécrire les fichiers si besoin
    })
    .then((result) => console.log(`✅ Upload réussi : ${result.secure_url}`))
    .catch((error) => console.error(`❌ Erreur d'upload : ${error.message}`));
});
