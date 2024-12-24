import fs from 'fs/promises';
import path from 'path';

// Chemin vers le fichier news.json
const filePath = path.join(process.cwd(), 'data', 'news.json');

export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier JSON :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    const newNews = await request.json();
    newNews.id = Date.now(); // Génération d'un ID unique
    data.push(newNews);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return new Response(JSON.stringify(newNews), { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une nouvelle :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    const updatedNews = await request.json();
    const index = data.findIndex((news) => news.id === updatedNews.id);

    if (index !== -1) {
      data[index] = updatedNews;
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return new Response(JSON.stringify(updatedNews), { status: 200 });
    } else {
      return new Response("Nouvelle introuvable", { status: 404 });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    const { id } = await request.json();
    const updatedData = data.filter((news) => news.id !== id);

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    return new Response("Nouvelle supprimée", { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
