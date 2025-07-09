import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test user
  const hashedPassword = await bcrypt.hash("password123", 12);
  
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
    },
  });

  console.log("✅ Created user:", user.email);

  // Create a test post
  const post = await prisma.post.upsert({
    where: { id: "seed-post-1" },
    update: {},
    create: {
      id: "seed-post-1",
      title: "Welcome to the T3 Stack App!",
      content: `This is your first post in the T3 Stack application! 

This app demonstrates a full-stack TypeScript setup with:
- Next.js 14 with App Router
- tRPC for type-safe APIs
- Prisma with PostgreSQL
- Material UI with dark/light themes
- NextAuth for authentication

Try creating your own posts, editing them, and exploring the features. The app includes full CRUD operations for posts, user authentication, and a beautiful Material UI interface with gradient text effects.

You can sign in with:
- Email: test@example.com
- Password: password123

Enjoy building with the T3 stack!`,
      published: true,
      authorId: user.id,
    },
  });

  console.log("✅ Created post:", post.title);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🎉 Seeding completed!");
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
