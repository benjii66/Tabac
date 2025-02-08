import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

dotenv.config();

// 📌 Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Chemin vers le fichier JSON contenant les actualités
const filePath = path.join(process.cwd(), "data", "news.json");

// 🔥 Fonction pour uploader une image sur Cloudinary (sans fichier local)
async function uploadToCloudinary(file, folder = "tabac") {
  if (!file || !(file instanceof File)) throw new Error("Fichier invalide");

  // Convertir le fichier en buffer et en Base64 pour l'envoyer directement
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");

  // Envoi direct vers Cloudinary
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${base64String}`,
    {
      folder,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    }
  );

  return result.secure_url; // Retourne l'URL Cloudinary
}

// ✅ **GET - Récupérer les actualités**
export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Erreur GET :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// ✅ **POST - Ajouter une actualité**
export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const date = formData.get("date");
    const mainImage = formData.get("image");

    if (!title || !description || !details || !date) {
      return new Response("Données obligatoires manquantes", { status: 400 });
    }

    let mainImageUrl = "/assets/images/placeholder.svg";
    if (mainImage instanceof File) {
      console.log("Fichier reçu :", mainImage.name);
      mainImageUrl = await uploadToCloudinary(mainImage);
    } else {
      console.log("Aucune image principale reçue, utilisation du placeholder.");
    }

    const imagesUrls = [];
    for (const key of Array.from(formData.keys()).filter((k) =>
      k.startsWith("images[")
    )) {
      const file = formData.get(key);
      if (file instanceof File) {
        imagesUrls.push(await uploadToCloudinary(file));
      }
    }

    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const newNews = {
      id: Date.now(),
      title,
      description,
      details,
      date,
      image: mainImageUrl,
      images: imagesUrls,
    };

    data.push(newNews);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    console.log("✅ Nouvelle actualité ajoutée avec succès :", newNews);

    return new Response(JSON.stringify(newNews), { status: 201 });
  } catch (error) {
    console.error("Erreur POST :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// ✅ **PUT - Modifier une actualité**
export async function PUT(request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id");
    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const date = formData.get("date");
    const removedImages = JSON.parse(formData.get("removedImages") || "[]");

    if (!id || !title || !description || !details || !date) {
      return new Response("Données manquantes", { status: 400 });
    }

    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const index = data.findIndex((news) => news.id === parseInt(id, 10));

    if (index === -1) {
      return new Response("Actualité introuvable", { status: 404 });
    }

    let existingImages = data[index].images.filter(
      (img) => !removedImages.includes(img)
    );

    for (const key of Array.from(formData.keys()).filter((k) =>
      k.startsWith("images[")
    )) {
      const file = formData.get(key);
      if (file instanceof File) {
        existingImages.push(await uploadToCloudinary(file));
      }
    }

    const mainImageFile = formData.get("image");
    const mainImageUrl =
      mainImageFile instanceof File
        ? await uploadToCloudinary(mainImageFile)
        : data[index].image;

    data[index] = {
      ...data[index],
      title,
      description,
      details,
      date,
      image: mainImageUrl,
      images: existingImages,
    };

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data[index]), { status: 200 });
  } catch (error) {
    console.error("Erreur PUT :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// ✅ **DELETE - Supprimer une actualité**
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    // Charger les actualités
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const articleToDelete = data.find((news) => news.id === parseInt(id, 10));

    if (!articleToDelete) {
      return new Response("Actualité introuvable", { status: 404 });
    }

    // 📌 1️⃣ Extraire les "public_id" de Cloudinary
    const extractPublicId = (url) => {
      if (!url.includes("res.cloudinary.com")) return null; // Ne pas toucher aux placeholders
      const parts = url.split("/");
      return parts.slice(-2).join("/").split(".")[0]; // Extrait le dossier + nom de fichier sans extension
    };

    const imagesToDelete = [articleToDelete.image, ...articleToDelete.images]
      .map(extractPublicId)
      .filter(Boolean); // Supprime les entrées nulles (placeholder)

    // 📌 2️⃣ Supprimer les images de Cloudinary
    if (imagesToDelete.length > 0) {
      console.log("🗑️ Suppression des images sur Cloudinary :", imagesToDelete);
      await cloudinary.api.delete_resources(imagesToDelete);
    } else {
      console.log("Aucune image Cloudinary à supprimer.");
    }

    // 📌 3️⃣ Supprimer l’article du JSON
    const updatedData = data.filter((news) => news.id !== parseInt(id, 10));
    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));

    return new Response("Actualité supprimée et images nettoyées ✅", {
      status: 200,
    });
  } catch (error) {
    console.error("Erreur DELETE :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
