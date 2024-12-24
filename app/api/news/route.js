import fs from "fs/promises";
import path from "path";

// Chemin vers le fichier news.json
const filePath = path.join(process.cwd(), "data", "news.json");

export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier JSON :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const details = formData.get("details");
    const date = formData.get("date");
    const file = formData.get("image"); // Image téléversée

    if (!title || !description || !details || !date) {
      return new Response("Données manquantes", { status: 400 });
    }

    // Gestion de l'image
    let imagePath = "/assets/images/placeholder.jpg"; // Valeur par défaut
    if (file && file.name) {
      const uploadDir = path.join(process.cwd(), "public", "assets", "images");
      const newFilePath = path.join(uploadDir, file.name);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Sauvegarde de l'image dans le dossier public
      await fs.writeFile(newFilePath, fileBuffer);

      // Mettre à jour le chemin
      imagePath = `/assets/images/${file.name}`;
    }

    // Charger les actualités existantes
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

    // Ajouter la nouvelle actualité
    const newNews = {
      id: Date.now(),
      title,
      description,
      details,
      date,
      image: imagePath,
    };
    data.push(newNews);

    // Sauvegarder dans le fichier JSON
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(newNews), { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une nouvelle :", error);
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
    const date = formData.get("date");
    const file = formData.get("image"); // Nouveau fichier image

    if (!id || !title || !description || !details || !date) {
      return new Response("Données manquantes", { status: 400 });
    }

    // Charger les actualités existantes
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const index = data.findIndex((news) => news.id === parseInt(id));

    if (index === -1) {
      return new Response("Nouvelle introuvable", { status: 404 });
    }

    // Gestion de l'image téléversée
    let imagePath = data[index].image; // Conserver l'image actuelle
    if (file && file.name) {
      const uploadDir = path.join(process.cwd(), "public", "assets", "images");
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
      date,
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
    const updatedData = data.filter((news) => news.id !== id);

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    return new Response("Nouvelle supprimée", { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
