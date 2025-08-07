exports.up = function(knex) {
  return knex.schema.createTable('doctors', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('specialization').notNullable();
    table.string('license_number').unique().notNullable();
    table.text('bio');
    table.json('availability'); // JSON object for weekly schedule
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('doctors');
};
