const fs = require('fs');
const path = require('path');
const root = path.resolve('src');
const files = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && /\.(js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
}
walk(root);
const updatedFiles = [];
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  text = text.replace(/(api\.(?:get|post|put|delete|patch)\(\s*)(['\`\"])\/api\//g, '$1$2/');
  text = text.replace(/(api\.(?:get|post|put|delete|patch)\(\s*)(['\`\"])\/api(['\`\"])\)/g, '$1$2$3');
  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    updatedFiles.push(path.relative(process.cwd(), file));
  }
}
console.log('updated', updatedFiles.length, 'files');
console.log(updatedFiles.join('\n'));