const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('Updating all accommodations to active...');
  
  const result = await prisma.accommodation.updateMany({
    where: {},
    data: {
      isActive: true
    }
  });
  
  console.log(`✅ Updated ${result.count} accommodations`);
  
  // Verify
  const active = await prisma.accommodation.count({ where: { isActive: true } });
  console.log(`✅ Active accommodations: ${active}`);
  
  await prisma.$disconnect();
}

fix();
