const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

const createUrlTable = () => {
  console.log('Creating url table...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS url (
      id TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      short_code TEXT NOT NULL UNIQUE,
      user_id TEXT,
      clicks INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
    );
  `);
  
  // 建立索引以加速查詢
  db.exec(`CREATE INDEX IF NOT EXISTS idx_url_short_code ON url(short_code);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_url_user_id ON url(user_id);`);

  console.log('Url table created successfully.');
};

createUrlTable();
db.close();
