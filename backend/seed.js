import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Delete existing users (for fresh start)
    await prisma.user.deleteMany();
    console.log('✓ Cleared existing users');

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@stclare.edu',
        password: adminPassword,
        fullName: 'Admin User',
        role: 'admin',
        isActive: true
      }
    });
    console.log('✓ Created admin user:', admin.username);

    // Create test user
    const testPassword = await hashPassword('test123');
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@stclare.edu',
        password: testPassword,
        fullName: 'Test User',
        role: 'user',
        isActive: true
      }
    });
    console.log('✓ Created test user:', testUser.username);

    console.log('✅ Database seed completed!');
    console.log('\nYou can now login with:');
    console.log('  Admin: admin / admin123');
    console.log('  User:  testuser / test123');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
