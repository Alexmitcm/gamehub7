// Test user database access
const { PrismaClient } = require('./src/generated/prisma-client');

async function testUser() {
  try {
    const prisma = new PrismaClient();
    console.log('✅ Prisma client created successfully');
    
    const testWallet = '0x1234567890123456789012345678901234567890';
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { walletAddress: testWallet }
    });
    
    if (user) {
      console.log('✅ User found:', user);
    } else {
      console.log('ℹ️ User not found, creating test user...');
      
      // Create a test user
      const newUser = await prisma.user.create({
        data: {
          walletAddress: testWallet,
          status: 'Standard',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Test user created:', newUser);
    }
    
    await prisma.$disconnect();
    console.log('✅ Prisma client disconnected successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUser();
