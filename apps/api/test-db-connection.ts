import { PrismaClient } from '@prisma/client';

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Test Prisma client
    const userCount = await prisma.user.count();
    console.log('✅ User table accessible, count:', userCount);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔍 Network connection refused - check firewall/network policies');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔍 Host not found - check DATABASE_URL');
    } else if (error.code === 'PAM2') {
      console.error('🔍 Authentication failed - check username/password');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
