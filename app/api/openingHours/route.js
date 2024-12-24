import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'openingHours.json');

export async function GET() {
  const data = await fs.readFile(filePath, 'utf-8');
  return new Response(data, { status: 200 });
}

export async function POST(request) {
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  const newHour = await request.json();
  data.push(newHour);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return new Response(JSON.stringify(newHour), { status: 201 });
}

export async function PUT(request) {
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  const updatedHour = await request.json();
  const index = data.findIndex((hour) => hour.day === updatedHour.day);

  if (index !== -1) {
    data[index] = updatedHour;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return new Response(JSON.stringify(updatedHour), { status: 200 });
  } else {
    return new Response('Horaire introuvable', { status: 404 });
  }
}

export async function DELETE(request) {
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  const { day } = await request.json();
  const updatedData = data.filter((hour) => hour.day !== day);

  await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
  return new Response('Horaire supprimé', { status: 200 });
}
