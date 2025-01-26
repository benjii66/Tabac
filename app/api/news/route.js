import fs from "fs/promises";
import path from "path";

// Chemin vers le fichier JSON contenant les actualités
const filePath = path.join(process.cwd(), "data", "news.json");

// Fonction pour sauvegarder une image
async function saveImage(file) {
  if (!file || !(file instanceof File)) {
    throw new Error("Le fichier n'est pas valide");
  }

  const uploadDir = path.join(process.cwd(), "public", "assets", "images");
  const fileName = file.name;
  const filePath = path.join(uploadDir, fileName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadDir, { recursive: true }); // Crée le répertoire si nécessaire
  await fs.writeFile(filePath, fileBuffer); // Sauvegarde l'image

  return `/assets/images/${fileName}`; // Retourne le chemin relatif
}

// Route GET : Récupérer les actualités
export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la lecture des actualités :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route POST : Ajouter une nouvelle actualité
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

    // Gestion de l'image principale
    const mainImagePath =
      mainImage && mainImage instanceof File
        ? await saveImage(mainImage)
        : "/assets/images/placeholder.svg";

    // Gestion des images multiples
    const imagesPaths = [];
    const imageKeys = Array.from(formData.keys()).filter((key) =>
      key.startsWith("images[")
    );

    for (const key of imageKeys) {
      const file = formData.get(key);
      if (file instanceof File) {
        imagesPaths.push(await saveImage(file));
      }
    }

    // Charger les actualités existantes
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

    // Créer une nouvelle actualité
    const newNews = {
      id: Date.now(),
      title,
      description,
      details,
      date,
      image: mainImagePath,
      images: imagesPaths,
    };

    // Sauvegarder l'actualité
    data.push(newNews);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(newNews), { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une actualité :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route PUT : Modifier une actualité
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

    // Charger les actualités existantes
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const index = data.findIndex((news) => news.id === parseInt(id, 10));

    if (index === -1) {
      return new Response("Actualité introuvable", { status: 404 });
    }

    // Mise à jour des images multiples
    let existingImages = data[index].images.filter(
      (img) => !removedImages.includes(img)
    );
    const imageKeys = Array.from(formData.keys()).filter((key) =>
      key.startsWith("images[")
    );

    for (const key of imageKeys) {
      const file = formData.get(key);
      if (file instanceof File) {
        existingImages.push(await saveImage(file));
      }
    }

    // Mise à jour de l'image principale (si modifiée)
    const mainImageFile = formData.get("image");
    const mainImagePath =
      mainImageFile instanceof File
        ? await saveImage(mainImageFile)
        : data[index].image;

    // Mise à jour de l'actualité
    data[index] = {
      ...data[index],
      title,
      description,
      details,
      date,
      image: mainImagePath,
      images: existingImages,
    };

    // Sauvegarde des modifications
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data[index]), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route DELETE : Supprimer une actualité
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const updatedData = data.filter((news) => news.id !== parseInt(id, 10));

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    return new Response("Actualité supprimée", { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
