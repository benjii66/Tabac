import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'services.json');

export async function GET() {
  const data = await fs.readFile(filePath, 'utf-8');
  return new Response(data, { status: 200 });
}

export async function POST(request) {
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  const newService = await request.json();
  newService.id = Date.now(); // Génère un ID unique
  data.push(newService);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return new Response(JSON.stringify(newService), { status: 201 });
}

export async function PUT(request) {
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  const updatedService = await request.json();
  const index = data.findIndex((service) => service.id === updatedService.id);

  if (index !== -1) {
    data[index] = updatedService;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return new Response(JSON.stringify(updatedService), { status: 200 });
  } else {
    return new Response('Service introuvable', { status: 404 });
  }
}

export async function DELETE(request) {
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  const { id } = await request.json();
  const updatedData = data.filter((service) => service.id !== id);

  await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
  return new Response('Service supprimé', { status: 200 });
}
