const fs = require('fs');
const path = require('path');
const knex = require('knex');

const action = process.argv[2];
const dbFile = process.argv[3] || '../wren-ui/testdb.sqlite3';
const dbPath = path.resolve(__dirname, '..', dbFile);

const db = knex({
  client: 'better-sqlite3',
  connection: dbPath,
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, '../migrations'),
  },
});

const resetDatabase = async () => {
  await db.table('project').del();
  await db.table('model').del();
  await db.table('model_column').del();
  await db.table('model_nested_column').del();
  await db.table('relation').del();
  await db.table('thread').del();
  await db.table('thread_response').del();
  await db.table('view').del();

  await db.table('learning').insert({
    paths: JSON.stringify(['DATA_MODELING_GUIDE', 'SWITCH_PROJECT_LANGUAGE']),
  });
};

const run = async () => {
  if (action === 'migrate') {
    await db.migrate.latest();
  } else if (action === 'remove') {
    await db.migrate.rollback();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  } else if (action === 'reset') {
    await resetDatabase();
  } else {
    throw new Error(`Unknown e2e-db action: ${action}`);
  }
};

run()
  .finally(() => db.destroy())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
