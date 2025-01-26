import fs from "fs/promises";
import path from "path";

// Chemins vers le fichier JSON et le dossier des images
const filePath = path.join(process.cwd(), "data", "services.json");
const uploadDir = path.join(process.cwd(), "public", "assets", "images");

// Fonction pour sauvegarder une image
async function saveImage(file) {
  if (!(file instanceof File)) {
    throw new Error("Le fichier n'est pas valide.");
  }

  const fileName = file.name;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const imagePath = path.join(uploadDir, fileName);

  // Créer le répertoire si nécessaire et sauvegarder l'image
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(imagePath, fileBuffer);

  return `/assets/images/${fileName}`;
}

// Route GET : Récupérer tous les services
export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des services :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route POST : Ajouter un service
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

    // Sauvegarde de l'image principale
    const mainImagePath =
      mainImage instanceof File
        ? await saveImage(mainImage)
        : "/assets/images/placeholder.svg";

    // Sauvegarde des images multiples
    const imagesPaths = await Promise.all(
      Array.from(formData.keys())
        .filter((key) => key.startsWith("images["))
        .map(async (key) => {
          const file = formData.get(key);
          return file instanceof File ? await saveImage(file) : null;
        })
    ).then((paths) => paths.filter(Boolean)); // Filtre les valeurs nulles

    // Charger les services existants et ajouter le nouveau service
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const newService = {
      id: Date.now(),
      title,
      description,
      details,
      image: mainImagePath,
      images: imagesPaths,
    };

    data.push(newService);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(newService), { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout du service :", error);
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

    // Charger les services existants et trouver le service à modifier
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const serviceIndex = data.findIndex(
      (service) => service.id === parseInt(id, 10)
    );

    if (serviceIndex === -1) {
      return new Response("Service introuvable", { status: 404 });
    }

    const service = data[serviceIndex];

    // Mettre à jour les images multiples
    const updatedImages = service.images.filter(
      (img) => !removedImages.includes(img)
    );
    const newImages = await Promise.all(
      Array.from(formData.keys())
        .filter((key) => key.startsWith("images["))
        .map(async (key) => {
          const file = formData.get(key);
          return file instanceof File ? await saveImage(file) : null;
        })
    ).then((paths) => paths.filter(Boolean));

    // Mettre à jour l'image principale (si modifiée)
    const mainImageFile = formData.get("image");
    const mainImagePath =
      mainImageFile instanceof File
        ? await saveImage(mainImageFile)
        : service.image;

    // Mise à jour des données
    data[serviceIndex] = {
      ...service,
      title,
      description,
      details,
      image: mainImagePath,
      images: [...updatedImages, ...newImages],
    };

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return new Response(JSON.stringify(data[serviceIndex]), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la modification du service :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

// Route DELETE : Supprimer un service
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    // Charger les services existants et filtrer le service à supprimer
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const updatedData = data.filter(
      (service) => service.id !== parseInt(id, 10)
    );

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    return new Response("Service supprimé", { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression du service :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
