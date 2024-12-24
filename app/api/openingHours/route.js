import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "openingHours.json");

export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des horaires :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const updatedHour = await request.json();

    // Validation des données
    if (!updatedHour.day || !updatedHour.hours) {
      return new Response("Données invalides", { status: 400 });
    }

    // Charger les horaires existants
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

    // Trouver l'entrée à mettre à jour
    const index = data.findIndex((hour) => hour.day === updatedHour.day);
    if (index === -1) {
      return new Response("Horaire introuvable", { status: 404 });
    }

    // Mettre à jour l'horaire
    data[index] = updatedHour;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(updatedHour), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des horaires :", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
