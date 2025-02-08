import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Chemin vers le fichier JSON contenant les actualités
const filePath = path.join(process.cwd(), "data", "news.json");

// Fonction pour générer un nom de fichier unique
function generateUniqueFileName(originalName) {
  const randomId = crypto.randomBytes(16).toString("hex");
  const extension = path.extname(originalName);
  return `${randomId}${extension}`;
}

// Fonction pour sauvegarder une image
async function saveImage(file) {
  if (!file || !(file instanceof File)) {
    console.error("Tentative de sauvegarde d'un fichier non valide");
    throw new Error("Le fichier n'est pas valide");
  }

  const uploadDir = path.join(process.cwd(), "public", "assets", "images");
  const fileName = generateUniqueFileName(file.name);
  const filePath = path.join(uploadDir, fileName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  console.log(`Création du répertoire ${uploadDir} si nécessaire`);
  await fs.mkdir(uploadDir, { recursive: true });
  console.log(`Sauvegarde de l'image sous ${filePath}`);
  await fs.writeFile(filePath, fileBuffer);

  return `/assets/images/${fileName}`;
}

// Route GET : Récupérer les actualités
export async function GET() {
  try {
    console.log("Lecture des actualités à partir du fichier");
    const data = await fs.readFile(filePath, "utf-8");
    console.log("Actualités récupérées avec succès");
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la lecture des actualités :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route POST : Ajouter une nouvelle actualité
export async function POST(request) {
  try {
    console.log("Traitement du formulaire pour ajouter une actualité");
    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const date = formData.get("date");
    const mainImage = formData.get("image");

    if (!title || !description || !details || !date) {
      console.error("Données obligatoires manquantes");
      return new Response("Données obligatoires manquantes", { status: 400 });
    }

    console.log("Gestion de l'image principale");
    const mainImagePath =
      mainImage && mainImage instanceof File
        ? await saveImage(mainImage)
        : "/assets/images/placeholder.svg";

    console.log("Gestion des images multiples");
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

    console.log("Chargement des actualités existantes pour ajout");
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

    const newNews = {
      id: Date.now(),
      title,
      description,
      details,
      date,
      image: mainImagePath,
      images: imagesPaths,
    };

    console.log("Ajout de la nouvelle actualité");
    data.push(newNews);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log("Nouvelle actualité enregistrée avec succès");

    return new Response(JSON.stringify(newNews), { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une actualité :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function PUT(request) {
  try {
    console.log("Réception des données du formulaire pour modification");
    const formData = await request.formData();

    const id = formData.get("id");
    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const date = formData.get("date");
    const removedImages = JSON.parse(formData.get("removedImages") || "[]");

    if (!id || !title || !description || !details || !date) {
      console.error("Données manquantes pour la modification");
      return new Response("Données manquantes", { status: 400 });
    }

    console.log(
      `Chargement des actualités pour trouver l'actualité avec l'ID ${id}`
    );
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const index = data.findIndex((news) => news.id === parseInt(id, 10));

    if (index === -1) {
      console.error(`Aucune actualité trouvée avec l'ID ${id}`);
      return new Response("Actualité introuvable", { status: 404 });
    }

    console.log("Mise à jour des images multiples");
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

    const mainImageFile = formData.get("image");
    const mainImagePath =
      mainImageFile instanceof File
        ? await saveImage(mainImageFile)
        : data[index].image;

    console.log(`Mise à jour de l'actualité avec l'ID ${id}`);
    data[index] = {
      ...data[index],
      title,
      description,
      details,
      date,
      image: mainImagePath,
      images: existingImages,
    };

    console.log(`Sauvegarde des modifications de l'actualité ${id}`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data[index]), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    console.log("Réception de la demande de suppression");
    const { id } = await request.json();

    console.log(`Chargement des actualités pour suppression avec l'ID ${id}`);
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const updatedData = data.filter((news) => news.id !== parseInt(id, 10));

    console.log(`Suppression de l'actualité avec l'ID ${id}`);
    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));

    return new Response("Actualité supprimée", { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
