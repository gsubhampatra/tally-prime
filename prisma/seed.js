require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const items = [
  { name: "Chaula (Rice)", category: "Rice", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Gama Chaula (Rejection Rice)", category: "Rice", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Khuda (Broken Rice)", category: "Rice", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Arua Khuda (Raw Broken Rice)", category: "Rice", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Usuna Khuda (Boiled/Parboiled Broken Rice)", category: "Rice", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Cheeru", category: "Rice", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Usuna Cheeru (Pin Broken Rice)", category: "Rice", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Arua Cheeru", category: "Rice", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Kunda (Rice Bran)", category: "Rice Bran", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Ani Chana", category: "Pulses", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Bila Chana", category: "Pulses", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Muga (Green Gram)", category: "Pulses", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Biri (Black Gram / Urad)", category: "Pulses", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Kolatha (Horse Gram)", category: "Pulses", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Gajiri Kolatha", category: "Pulses", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Rasi (Mustard)", category: "Oilseeds", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Bhalia", category: "Rice", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Juani (Ajwain)", category: "Spices", unit: "Kg", basePrice: 0, sellingPrice: 0 },
  { name: "Tentuli (Tamarind)", category: "Spices", unit: "Kg", basePrice: 0, sellingPrice: 0 },
];

async function main() {
  for (const item of items) {
    const existing = await prisma.item.findFirst({ where: { name: item.name } });

    if (existing) continue;

    await prisma.item.create({ data: item });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });