exports.up = function(knex) {
  return knex.schema.createTable('supplies', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.integer('current_stock').defaultTo(0);
    table.integer('minimum_stock').defaultTo(10);
    table.date('expiry_date');
    table.decimal('unit_price', 10, 2);
    table.string('supplier');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('supplies');
};
