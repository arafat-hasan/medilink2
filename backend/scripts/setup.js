const knex = require('knex')(require('../knexfile').development);

async function setupDatabase() {
  try {
    console.log('🔄 Setting up MediLink database...');
    
    // Run migrations
    console.log('📊 Running database migrations...');
    await knex.migrate.latest();
    console.log('✅ Migrations completed successfully');
    
    // Run seeds
    console.log('🌱 Seeding database with initial data...');
    await knex.seed.run();
    console.log('✅ Database seeded successfully');
    
    console.log('🎉 Database setup completed!');
    console.log('\n📋 Demo accounts created:');
    console.log('👤 Admin: admin@medilink.com / password123');
    console.log('👨‍⚕️ Doctor: dr.smith@medilink.com / password123');
    console.log('🏥 Patient: patient1@example.com / password123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await knex.destroy();
  }
}

setupDatabase();
