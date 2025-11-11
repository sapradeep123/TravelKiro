const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const accommodations = await prisma.accommodation.findMany();
  console.log('Total accommodations:', accommodations.length);
  
  if (accommodations.length > 0) {
    console.log('\nFirst accommodation:');
    console.log('- Name:', accommodations[0].name);
    console.log('- Type:', accommodations[0].type);
    console.log('- Status:', accommodations[0].approvalStatus);
    console.log('- Active:', accommodations[0].isActive);
    console.log('- Country:', accommodations[0].country);
  }
  
  await prisma.$disconnect();
}

check();
