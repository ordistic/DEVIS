const fs = require('fs');
const path = require('path');

const schema = fs.readFileSync(path.join(__dirname, 'supabase_schema.sql'), 'utf8');
const dbJs = fs.readFileSync(path.join(__dirname, 'js/db.js'), 'utf8');

// Find all CREATE TABLE in schema
const schemaTables = [];
const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi;
let match;
while ((match = tableRegex.exec(schema)) !== null) {
  schemaTables.push(match[1].toLowerCase());
}

// Find tables in db.js
const dbTables = [];
const dbMatch = dbJs.match(/tables:\s*\[([\s\S]*?)\]/);
if (dbMatch) {
  const itemRegex = /['"]([a-zA-Z0-9_]+)['"]/g;
  let im;
  while ((im = itemRegex.exec(dbMatch[1])) !== null) {
    dbTables.push(im[1].toLowerCase());
  }
}

console.log('Schema tables count:', schemaTables.length);
console.log('DB.js tables count:', dbTables.length);

const missingInSchema = dbTables.filter(t => !schemaTables.includes(t));
console.log('Tables in DB.js but MISSING in supabase_schema.sql:', missingInSchema);

const missingInDb = schemaTables.filter(t => !dbTables.includes(t));
console.log('Tables in supabase_schema.sql but NOT in db.js:', missingInDb);
