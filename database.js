const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./usernames.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users ( 
        user_id TEXT PRIMARY KEY, 
        usernames TEXT
        )`);
});

module.exports = db;