// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@site.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@site.com",
      password: "admin123", // à hasher en prod
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
