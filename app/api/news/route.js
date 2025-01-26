import fs from "fs/promises";
import path from "path";

// Chemin vers le fichier news.json
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

  // Créer le répertoire si nécessaire
  await fs.mkdir(uploadDir, { recursive: true });

  // Sauvegarder l'image
  await fs.writeFile(filePath, fileBuffer);

  // Retourner le chemin de l'image
  return `/assets/images/${fileName}`;
}

// Route GET
export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier JSON :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route POST : Ajouter une nouvelle actualité
export async function POST(request) {
  try {
    const formData = await request.formData();
    console.log("FormData reçu :", Array.from(formData.entries()));

    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const date = formData.get("date");
    const mainImage = formData.get("image");

    if (!title || !description || !details || !date) {
      console.error("Données manquantes :", {
        title,
        description,
        details,
        date,
      });
      return new Response("Données obligatoires manquantes", { status: 400 });
    }

    // Gestion de l'image principale
    let mainImagePath = "/assets/images/placeholder.svg";
    if (mainImage && mainImage instanceof File) {
      mainImagePath = await saveImage(mainImage);
    }

    // Gestion des images multiples
    const imagesPaths = [];
    const imageKeys = Array.from(formData.keys()).filter((key) =>
      key.startsWith("images[")
    );

    for (const key of imageKeys) {
      const file = formData.get(key);
      if (file instanceof File) {
        const newImagePath = await saveImage(file);
        imagesPaths.push(newImagePath);
      }
    }

    console.log("Chemins des images multiples :", imagesPaths);

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
    console.error("Erreur lors de l'ajout d'une nouvelle actualité :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route PUT : Modifier une actualité
export async function PUT(request) {
  try {
    const formData = await request.formData();
    console.log("FormData reçu :", Array.from(formData.entries()));

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
      return new Response("Nouvelle introuvable", { status: 404 });
    }

    // Gestion des images multiples
    let existingImages = data[index].images.filter(
      (img) => !removedImages.includes(img)
    );
    const imageKeys = Array.from(formData.keys()).filter((key) =>
      key.startsWith("images[")
    );

    for (const key of imageKeys) {
      const file = formData.get(key);
      if (file instanceof File) {
        const newImagePath = await saveImage(file);
        existingImages.push(newImagePath);
      }
    }

    console.log("Images mises à jour :", existingImages);

    // Gestion de l'image principale (si modifiée)
    const mainImageFile = formData.get("image");
    let mainImagePath = data[index].image;

    if (mainImageFile instanceof File) {
      mainImagePath = await saveImage(mainImageFile);
    }

    // Mettre à jour les données
    data[index] = {
      ...data[index],
      title,
      description,
      details,
      date,
      image: mainImagePath,
      images: existingImages,
    };

    // Sauvegarder les modifications
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
    return new Response("Nouvelle supprimée", { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
