const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clear existing data
  await knex('appointments').del();
  await knex('supplies').del();
  await knex('doctors').del();
  await knex('users').del();

  // Insert users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await knex('users').insert([
    {
      id: 1,
      email: 'admin@medilink.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      phone: '+1234567890',
      role: 'admin'
    },
    {
      id: 2,
      email: 'dr.smith@medilink.com',
      password: hashedPassword,
      first_name: 'John',
      last_name: 'Smith',
      phone: '+1234567891',
      role: 'doctor'
    },
    {
      id: 3,
      email: 'dr.johnson@medilink.com',
      password: hashedPassword,
      first_name: 'Sarah',
      last_name: 'Johnson',
      phone: '+1234567892',
      role: 'doctor'
    },
    {
      id: 4,
      email: 'patient1@example.com',
      password: hashedPassword,
      first_name: 'Alice',
      last_name: 'Brown',
      phone: '+1234567893',
      role: 'patient'
    },
    {
      id: 5,
      email: 'patient2@example.com',
      password: hashedPassword,
      first_name: 'Bob',
      last_name: 'Wilson',
      phone: '+1234567894',
      role: 'patient'
    }
  ]);

  // Insert doctors
  await knex('doctors').insert([
    {
      id: 1,
      user_id: 2,
      specialization: 'Cardiology',
      license_number: 'MD001',
      bio: 'Experienced cardiologist with 15 years of practice.',
      availability: JSON.stringify({
        monday: ['09:00', '17:00'],
        tuesday: ['09:00', '17:00'],
        wednesday: ['09:00', '17:00'],
        thursday: ['09:00', '17:00'],
        friday: ['09:00', '15:00']
      })
    },
    {
      id: 2,
      user_id: 3,
      specialization: 'Pediatrics',
      license_number: 'MD002',
      bio: 'Pediatric specialist focusing on child healthcare.',
      availability: JSON.stringify({
        monday: ['08:00', '16:00'],
        tuesday: ['08:00', '16:00'],
        wednesday: ['08:00', '16:00'],
        thursday: ['08:00', '16:00'],
        friday: ['08:00', '14:00']
      })
    }
  ]);

  // Insert supplies
  await knex('supplies').insert([
    {
      id: 1,
      name: 'Stethoscope',
      description: 'Digital stethoscope for cardiac examination',
      current_stock: 5,
      minimum_stock: 3,
      expiry_date: null,
      unit_price: 150.00,
      supplier: 'MedEquip Inc'
    },
    {
      id: 2,
      name: 'Blood Pressure Monitor',
      description: 'Automatic blood pressure monitoring device',
      current_stock: 2,
      minimum_stock: 5,
      expiry_date: null,
      unit_price: 200.00,
      supplier: 'HealthTech Solutions'
    },
    {
      id: 3,
      name: 'Disposable Syringes',
      description: '10ml disposable syringes',
      current_stock: 100,
      minimum_stock: 50,
      expiry_date: '2025-12-31',
      unit_price: 0.50,
      supplier: 'MedSupply Co'
    },
    {
      id: 4,
      name: 'Surgical Gloves',
      description: 'Latex-free surgical gloves',
      current_stock: 10,
      minimum_stock: 20,
      expiry_date: '2025-06-30',
      unit_price: 0.25,
      supplier: 'SafeHands Medical'
    }
  ]);

  // Insert appointments
  const futureDate1 = new Date();
  futureDate1.setDate(futureDate1.getDate() + 1);
  
  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 3);

  await knex('appointments').insert([
    {
      id: 1,
      patient_id: 4,
      doctor_id: 1,
      appointment_date: futureDate1.toISOString(),
      appointment_type: 'Consultation',
      status: 'scheduled',
      notes: 'Regular checkup',
      required_supplies: JSON.stringify([1, 2])
    },
    {
      id: 2,
      patient_id: 5,
      doctor_id: 2,
      appointment_date: futureDate2.toISOString(),
      appointment_type: 'Vaccination',
      status: 'scheduled',
      notes: 'Annual vaccination',
      required_supplies: JSON.stringify([3, 4])
    }
  ]);
};
