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
const JSON_PUBLIC_ID = "tabac/json/services.json"; // Remplace par le bon dossier Cloudinary

// 🔥 Fonction pour récupérer le JSON depuis Cloudinary
async function fetchJSONFromCloudinary() {
  try {
    const result = await cloudinary.api.resource(JSON_PUBLIC_ID, {
      resource_type: "raw",
    });
    const response = await fetch(result.secure_url);
    const data = await response.json();
    return Array.isArray(data) ? data : []; // ✅ Empêche une erreur si le JSON est corrompu
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
        public_id: "services.json", // 📌 FIX: Bien forcer le même nom !
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

// 🔥 Fonction pour uploader plusieurs images en parallèle sur Cloudinary
async function uploadImages(files) {
  return await Promise.all(
    files.map(async (file) => {
      return await uploadToCloudinary(file);
    })
  );
}

// ✅ **POST - Ajouter une actualité**
export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const mainImage = formData.get("image");

    if (!title || !description || !details) {
      return new Response("Données obligatoires manquantes", { status: 400 });
    }

    // 📌 Récupérer le JSON existant AVANT d’ajouter le service
    const data = await fetchJSONFromCloudinary();

    // ✅ Trouver le dernier ID et générer un ID logique
    const lastId =
      data.length > 0 ? Math.max(...data.map((service) => service.id)) : 0;
    const newId = lastId + 1;

    const mainImageUrl = mainImage; // 👈 C’est déjà une URL string
    const imagesUrls = Array.from(formData.getAll("images[]")).filter(Boolean);

    // 📌 Ajouter le service au tableau avec l'ID court
    const newService = {
      id: newId, // ✅ Utilisation d'un ID incrémental
      title,
      description,
      details,
      image: mainImageUrl,
      images: imagesUrls,
    };

    data.push(newService); // Ajout du service dans le JSON

    // 📌 Mettre à jour le fichier JSON sur Cloudinary
    await updateJSONOnCloudinary(data);

    return new Response(JSON.stringify(newService), { status: 201 });
  } catch (error) {
    console.error("❌ Erreur POST :", error);
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
    const mainImage = formData.get("image");
    const removedImages = JSON.parse(formData.get("removedImages") || "[]");

    if (
      !title ||
      !description ||
      !details ||
      (mainImage &&
        typeof mainImage !== "string" &&
        !(mainImage instanceof File))
    ) {
      return new Response("Données obligatoires manquantes ou image invalide", {
        status: 400,
      });
    }

    // 📌 Récupérer le JSON existant
    let data = await fetchJSONFromCloudinary();
    let ServiceToEdit = data.find(
      (services) => services.id === parseInt(id, 10)
    );

    if (!ServiceToEdit) {
      return new Response("Service introuvable", { status: 404 });
    }

    // 📌 Gérer l’image principale (si modifiée)
    let mainImageUrl = ServiceToEdit.image;

    if (mainImage instanceof File) {
      // ✅ Nouvelle image → upload
      console.log("Nouvelle image principale reçue :", mainImage.name);
      mainImageUrl = await uploadToCloudinary(mainImage);

      // ✅ Supprimer l'ancienne image
      const oldImagePublicId = extractPublicId(ServiceToEdit.image);
      if (oldImagePublicId) {
        await cloudinary.api.delete_resources([oldImagePublicId]);
      }
    } else if (typeof mainImage === "string") {
      // ✅ Image déjà hébergée → on garde l’URL telle quelle
      mainImageUrl = mainImage;
    }

    // 📌 Gérer les images multiples (ajoutées/supprimées)
    const updatedImages = formData.getAll("images[]").filter(Boolean);

    // 📌 Mettre à jour la news modifiée
    const updatedService = {
      ...ServiceToEdit,
      title,
      description,
      details,
      image: mainImageUrl,
      images: updatedImages,
    };

    // 📌 Remplacer l'ancienne news par la nouvelle dans le JSON
    data = data.map((services) =>
      services.id === parseInt(id, 10) ? updatedService : services
    );

    // 📌 Mettre à jour le JSON dans Cloudinary
    await updateJSONOnCloudinary(data);

    return new Response(JSON.stringify(updatedService), { status: 200 });
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
    const serviceToDelete = data.find(
      (services) => services.id === parseInt(id, 10)
    );

    if (!serviceToDelete) {
      return new Response("Actualité introuvable", { status: 404 });
    }

    // 📌 Supprimer les images Cloudinary liées
    const extractPublicId = (url) => {
      if (!url.includes("res.cloudinary.com")) return null;
      const parts = url.split("/");
      return parts.slice(-2).join("/").split(".")[0];
    };

    const imagesToDelete = [serviceToDelete.image, ...serviceToDelete.images]
      .map(extractPublicId)
      .filter(Boolean);

    if (imagesToDelete.length > 0) {
      await cloudinary.api.delete_resources(imagesToDelete);
    }

    // 📌 Supprimer l’article du JSON
    data = data.filter((services) => services.id !== parseInt(id, 10));

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
  try {
    if (!file || !(file instanceof File))
      throw new Error("❌ Fichier invalide");

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    console.log(`📤 Uploading ${file.name} to Cloudinary...`);

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64String}`,
      {
        folder,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      }
    );

    console.log("✅ Upload réussi :", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("❌ Erreur lors de l’upload :", error);
    return null;
  }
}
