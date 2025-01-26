import fs from "fs/promises";
import path from "path";

// Chemin vers le fichier JSON et dossier des images
const filePath = path.join(process.cwd(), "data", "services.json");
const uploadDir = path.join(process.cwd(), "public", "assets", "images");

// Fonction pour sauvegarder une image
async function saveImage(file) {
  if (!file || !(file instanceof File)) {
    throw new Error("Le fichier n'est pas valide");
  }

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
    console.error("Erreur lors de la récupération des services :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route POST : Ajouter un nouveau service
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

    // Charger les services existants
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

    // Créer un nouveau service
    const newService = {
      id: Date.now(),
      title,
      description,
      details,
      image: mainImagePath,
      images: imagesPaths,
    };

    // Ajouter et sauvegarder
    data.push(newService);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(newService), { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un service :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route PUT : Modifier un service
export async function PUT(request) {
  try {
    const formData = await request.formData();

    const id = formData.get("id");
    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const removedImages = JSON.parse(formData.get("removedImages") || "[]");

    if (!id || !title || !description || !details) {
      return new Response("Données obligatoires manquantes", { status: 400 });
    }

    // Charger les services existants
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const index = data.findIndex((service) => service.id === parseInt(id, 10));

    if (index === -1) {
      return new Response("Service introuvable", { status: 404 });
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

    // Gestion de l'image principale (si modifiée)
    const mainImageFile = formData.get("image");
    let mainImagePath = data[index].image;

    if (mainImageFile instanceof File) {
      mainImagePath = await saveImage(mainImageFile);
    }

    // Mettre à jour le service
    data[index] = {
      ...data[index],
      title,
      description,
      details,
      image: mainImagePath,
      images: existingImages,
    };

    // Sauvegarder
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data[index]), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route DELETE : Supprimer un service
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    // Charger les services existants
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const updatedData = data.filter(
      (service) => service.id !== parseInt(id, 10)
    );

    // Sauvegarder les modifications
    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    return new Response("Service supprimé", { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
