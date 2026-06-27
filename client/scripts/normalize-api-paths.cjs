const fs = require('fs');
const path = require('path');
const glob = require('glob');
const root = path.resolve('src');
const pattern = `${root}/**/*.{js,jsx}`;
const files = glob.sync(pattern, { nodir: true });
let updatedFiles = [];
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  text = text.replace(/(api\.(?:get|post|put|delete|patch)\(\s*)(['\"])\/api/g, '$1$2/');
  text = text.replace(/(api\.(?:get|post|put|delete|patch)\(\s*)(`)\/api/g, '$1`/');
  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    updatedFiles.push(path.relative(process.cwd(), file));
  }
}
console.log('updated', updatedFiles.length, 'files');
console.log(updatedFiles.join('\n'));