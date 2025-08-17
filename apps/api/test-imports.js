// Test basic imports
console.log('Testing basic imports...');

try {
  // Test if we can import the generated Prisma client
  const { PrismaClient, UserStatus } = require('./src/generated/prisma-client');
  console.log('✅ Prisma client imported successfully');
  console.log('✅ UserStatus enum values:', Object.values(UserStatus));
} catch (error) {
  console.error('❌ Error importing Prisma client:', error.message);
}

try {
  // Test if we can import the services
  const UserStatusService = require('./src/services/UserStatusService').default;
  console.log('✅ UserStatusService imported successfully');
} catch (error) {
  console.error('❌ Error importing UserStatusService:', error.message);
}

try {
  // Test if we can import the controllers
  const PremiumRegistrationController = require('./src/controllers/PremiumRegistrationController').default;
  console.log('✅ PremiumRegistrationController imported successfully');
} catch (error) {
  console.error('❌ Error importing PremiumRegistrationController:', error.message);
}

console.log('Import test completed');
