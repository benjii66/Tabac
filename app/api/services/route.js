import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "services.json");
const uploadDir = path.join(process.cwd(), "public", "assets", "images");

export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des services :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const file = formData.get("image"); // Image téléversée

    if (!title || !description || !details) {
      return new Response("Données manquantes", { status: 400 });
    }

    // Gestion de l'image
    let imagePath = "/assets/images/placeholder.svg"; // Valeur par défaut
    if (file && file.name) {
      const newFilePath = path.join(uploadDir, file.name);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Sauvegarde de l'image dans le dossier public
      await fs.writeFile(newFilePath, fileBuffer);

      // Mettre à jour le chemin
      imagePath = `/assets/images/${file.name}`;
    }

    // Charger les services existants
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

    // Ajouter le nouveau service
    const newService = {
      id: Date.now(),
      title,
      description,
      details,
      image: imagePath,
    };
    data.push(newService);

    // Sauvegarder dans le fichier JSON
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(newService), { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un service :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Parse les données envoyées
    const formData = await request.formData();
    const id = formData.get("id");
    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const file = formData.get("image"); // Nouveau fichier image

    if (!id || !title || !description || !details) {
      return new Response("Données manquantes", { status: 400 });
    }

    // Charger les services existants
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const index = data.findIndex((service) => service.id === parseInt(id));

    if (index === -1) {
      return new Response("Service introuvable", { status: 404 });
    }

    // Gestion de l'image téléversée
    let imagePath = data[index].image; // Conserver l'image actuelle
    if (file && file.name) {
      const newFilePath = path.join(uploadDir, file.name);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Sauvegarde de l'image
      await fs.writeFile(newFilePath, fileBuffer);

      // Mettre à jour le chemin
      imagePath = `/assets/images/${file.name}`;
    }

    // Mettre à jour les données
    data[index] = {
      ...data[index],
      title,
      description,
      details,
      image: imagePath,
    };

    // Sauvegarde des modifications
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data[index]), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const { id } = await request.json();
    const updatedData = data.filter((service) => service.id !== parseInt(id));

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    return new Response("Service supprimé", { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
