exports.up = function(knex) {
  return knex.schema.createTable('appointments', table => {
    table.increments('id').primary();
    table.integer('patient_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('doctor_id').unsigned().references('id').inTable('doctors').onDelete('CASCADE');
    table.datetime('appointment_date').notNullable();
    table.string('appointment_type').notNullable();
    table.enum('status', ['scheduled', 'completed', 'cancelled']).defaultTo('scheduled');
    table.text('notes');
    table.json('required_supplies'); // JSON array of supply IDs
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('appointments');
};
