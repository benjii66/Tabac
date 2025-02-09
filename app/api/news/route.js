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
const JSON_PUBLIC_ID = "tabac/json/news.json"; // Remplace par le bon dossier Cloudinary

// 🔥 Fonction pour récupérer le JSON depuis Cloudinary
async function fetchJSONFromCloudinary() {
  try {
    const result = await cloudinary.api.resource(JSON_PUBLIC_ID, {
      resource_type: "raw",
    });

    const response = await fetch(result.secure_url);
    return await response.json();
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du JSON :", error);
    return [];
  }
}

// 🔥 Fonction pour mettre à jour le JSON existant sur Cloudinary
async function updateJSONOnCloudinary(data) {
  try {
    const base64String = Buffer.from(JSON.stringify(data, null, 2)).toString(
      "base64"
    );

    const result = await cloudinary.uploader.upload(
      `data:application/json;base64,${base64String}`,
      {
        resource_type: "raw",
        folder: "tabac/json",
        public_id: "news.json", // 📌 FIX: Bien forcer le même nom !
        overwrite: true, // 📌 FIX: On remplace bien l'ancien JSON
        invalidate: true, // 📌 FIX: On force Cloudinary à invalider le cache
      }
    );

    return result.secure_url;
  } catch (error) {
    console.error("❌ Erreur lors de l’update du JSON :", error);
    return null;
  }
}

// ✅ **GET - Récupérer les actualités**
export async function GET() {
  try {
    const data = await fetchJSONFromCloudinary();
    return new Response(JSON.stringify(data), { status: 200 });
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

    // 📌 Récupérer le JSON existant AVANT d’ajouter la news
    const data = await fetchJSONFromCloudinary();

    // 📌 Uploader l’image principale si nécessaire
    let mainImageUrl = "/assets/images/placeholder.svg";
    if (mainImage instanceof File) {
      console.log("Fichier reçu :", mainImage.name);
      mainImageUrl = await uploadToCloudinary(mainImage);
    }

    // 📌 Uploader les images secondaires
    const imagesUrls = [];
    for (const key of Array.from(formData.keys()).filter((k) =>
      k.startsWith("images[")
    )) {
      const file = formData.get(key);
      if (file instanceof File) {
        imagesUrls.push(await uploadToCloudinary(file));
      }
    }

    // 📌 Ajouter la nouvelle actualité au tableau
    const newNews = {
      id: Date.now(),
      title,
      description,
      details,
      date,
      image: mainImageUrl,
      images: imagesUrls,
    };

    data.push(newNews); // Ajout de la nouvelle news dans le JSON existant

    // 📌 Mettre à jour le fichier JSON sur Cloudinary
    await updateJSONOnCloudinary(data);

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
    const mainImage = formData.get("image");
    const removedImages = JSON.parse(formData.get("removedImages") || "[]");

    if (!id || !title || !description || !details || !date) {
      return new Response("Données obligatoires manquantes", { status: 400 });
    }

    // 📌 Récupérer le JSON existant
    let data = await fetchJSONFromCloudinary();
    let newsToEdit = data.find((news) => news.id === parseInt(id, 10));

    if (!newsToEdit) {
      return new Response("Actualité introuvable", { status: 404 });
    }

    // 📌 Gérer l’image principale (si modifiée)
    let mainImageUrl = newsToEdit.image; // Garde l’ancienne image si pas modifiée
    if (mainImage instanceof File) {
      console.log("Nouvelle image principale reçue :", mainImage.name);
      mainImageUrl = await uploadToCloudinary(mainImage);

      // Supprimer l'ancienne image sur Cloudinary
      const oldImagePublicId = extractPublicId(newsToEdit.image);
      if (oldImagePublicId) {
        await cloudinary.api.delete_resources([oldImagePublicId]);
      }
    }

    // 📌 Gérer les images multiples (ajoutées/supprimées)
    let updatedImages = newsToEdit.images || [];

    // Supprimer les images retirées par l'utilisateur
    updatedImages = updatedImages.filter((img) => !removedImages.includes(img));

    // Ajouter les nouvelles images uploadées
    for (const key of Array.from(formData.keys()).filter((k) =>
      k.startsWith("images[")
    )) {
      const file = formData.get(key);
      if (file instanceof File) {
        updatedImages.push(await uploadToCloudinary(file));
      }
    }

    // 📌 Mettre à jour la news modifiée
    const updatedNews = {
      ...newsToEdit,
      title,
      description,
      details,
      date,
      image: mainImageUrl,
      images: updatedImages,
    };

    // 📌 Remplacer l'ancienne news par la nouvelle dans le JSON
    data = data.map((news) =>
      news.id === parseInt(id, 10) ? updatedNews : news
    );

    // 📌 Mettre à jour le JSON dans Cloudinary
    await updateJSONOnCloudinary(data);

    return new Response(JSON.stringify(updatedNews), { status: 200 });
  } catch (error) {
    console.error("Erreur PUT :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// 📌 Fonction pour extraire l’ID public d’une image Cloudinary
function extractPublicId(url) {
  if (!url.includes("res.cloudinary.com")) return null;
  const parts = url.split("/");
  return parts.slice(-2).join("/").split(".")[0];
}

// ✅ **DELETE - Supprimer une actualité**
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    let data = await fetchJSONFromCloudinary();
    const articleToDelete = data.find((news) => news.id === parseInt(id, 10));

    if (!articleToDelete) {
      return new Response("Actualité introuvable", { status: 404 });
    }

    // 📌 Supprimer les images Cloudinary liées
    const extractPublicId = (url) => {
      if (!url.includes("res.cloudinary.com")) return null;
      const parts = url.split("/");
      return parts.slice(-2).join("/").split(".")[0];
    };

    const imagesToDelete = [articleToDelete.image, ...articleToDelete.images]
      .map(extractPublicId)
      .filter(Boolean);

    if (imagesToDelete.length > 0) {
      await cloudinary.api.delete_resources(imagesToDelete);
    }

    // 📌 Supprimer l’article du JSON
    data = data.filter((news) => news.id !== parseInt(id, 10));

    // 📌 Mettre à jour le JSON sur Cloudinary après suppression
    await updateJSONOnCloudinary(data);

    return new Response("Actualité supprimée ✅", { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// 🔥 Fonction pour uploader une image sur Cloudinary
async function uploadToCloudinary(file, folder = "tabac") {
  if (!file || !(file instanceof File)) throw new Error("Fichier invalide");

  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");

  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${base64String}`,
    {
      folder,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    }
  );

  return result.secure_url;
}
