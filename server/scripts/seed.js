const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create a sample organization (law firm)
  const lawFirm = await prisma.organization.create({
    data: {
      name: 'Your Law Firm',
      type: 'CURRENT_LAW_FIRM',
      website: 'https://yourlawfirm.com',
      streetAddress: '123 Main Street',
      city: 'Your City',
      state: 'ST',
      zipCode: '12345'
    }
  });

  console.log('Created law firm organization:', lawFirm.name);

  // Create a sample client
  const client = await prisma.client.create({
    data: {
      clientNumber: '1000001',
      clientName: 'Sample Client Corporation'
    }
  });

  console.log('Created sample client:', client.clientName);

  // Create a sample matter
  const matter = await prisma.matter.create({
    data: {
      matterNumber: '100001',
      matterName: 'Sample Matter',
      status: 'COLLECTION',
      clientId: client.id
    }
  });

  console.log('Created sample matter:', matter.matterName);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
