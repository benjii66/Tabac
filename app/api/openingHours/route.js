import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// 📌 Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📍 URL Cloudinary du fichier JSON
const JSON_PUBLIC_ID = "tabac/json/openingHours.json";

// 🔥 Fonction pour récupérer le JSON depuis Cloudinary
async function fetchOpeningHoursFromCloudinary() {
  try {
    const result = await cloudinary.api.resource(JSON_PUBLIC_ID, {
      resource_type: "raw",
    });

    const response = await fetch(result.secure_url);
    return await response.json();
  } catch (error) {
    console.error("❌ Erreur récupération JSON horaires :", error);
    return [];
  }
}

// 🔥 Fonction pour mettre à jour le JSON existant sur Cloudinary
async function updateOpeningHoursOnCloudinary(data) {
  try {
    const base64String = Buffer.from(JSON.stringify(data, null, 2)).toString(
      "base64"
    );

    const result = await cloudinary.uploader.upload(
      `data:application/json;base64,${base64String}`,
      {
        resource_type: "raw",
        folder: "tabac/json",
        public_id: "openingHours.json",
        overwrite: true,
        invalidate: true,
      }
    );

    return result.secure_url;
  } catch (error) {
    console.error("❌ Erreur mise à jour JSON horaires :", error);
    return null;
  }
}

// ✅ **GET - Récupérer les horaires**
export async function GET() {
  try {
    const data = await fetchOpeningHoursFromCloudinary();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("❌ Erreur GET horaires :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// ✅ **PUT - Modifier un horaire**
export async function PUT(request) {
  try {
    const updatedHour = await request.json();

    if (!updatedHour.day || !updatedHour.hours) {
      return new Response("Données invalides", { status: 400 });
    }

    // 📌 Récupérer le JSON existant
    let data = await fetchOpeningHoursFromCloudinary();

    // 📌 Trouver l'horaire à mettre à jour
    const index = data.findIndex((hour) => hour.day === updatedHour.day);
    if (index === -1) {
      return new Response("Horaire introuvable", { status: 404 });
    }

    // 📌 Mettre à jour l'horaire
    data[index] = updatedHour;

    // 📌 Sauvegarder sur Cloudinary
    const success = await updateOpeningHoursOnCloudinary(data);
    if (!success) throw new Error("Erreur mise à jour Cloudinary");

    return new Response(JSON.stringify(updatedHour), { status: 200 });
  } catch (error) {
    console.error("❌ Erreur PUT horaires :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
