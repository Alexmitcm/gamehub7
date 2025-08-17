// Test Prisma client
const { PrismaClient } = require('./src/generated/prisma-client');

async function testPrisma() {
  try {
    const prisma = new PrismaClient();
    console.log('✅ Prisma client created successfully');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log('✅ User count query successful:', userCount);
    
    await prisma.$disconnect();
    console.log('✅ Prisma client disconnected successfully');
  } catch (error) {
    console.error('❌ Prisma error:', error.message);
  }
}

testPrisma();
