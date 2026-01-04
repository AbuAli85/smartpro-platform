import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('server/db-oman.ts', 'utf8');

// Replace all occurrences where we use db directly without getDb()
const fixed = content
  .replace(/^(export async function \w+[^{]+\{)\n(\s+)(const db = await getDb\(\);)/gm, '$1\n$2$3')
  .replace(/^(export async function \w+[^{]+\{)(?!\n\s+const db = await getDb)/gm, '$1\n  const db = await getDb();\n  if (!db) throw new Error("Database not available");')
  .replace(/(\n\s+)(await db\.(select|insert|update|delete|execute))/g, '$1const dbInstance = await getDb();\n  if (!dbInstance) throw new Error("Database not available");\n  $1await dbInstance.$3')
  .replace(/const dbInstance = await getDb\(\);\s+if \(!dbInstance\) throw new Error\("Database not available"\);\s+const dbInstance/g, 'const dbInstance');

writeFileSync('server/db-oman.ts', fixed);
console.log('Fixed db-oman.ts');
