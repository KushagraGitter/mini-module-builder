const fs = require('fs');
const path = require('path');
const parser = require("@babel/parser");
const traverse = require('babel-traverse').default;
const {transformFromAst} = require('babel-core');

let Id = 0;

function createDependency(fileName) {

  const file = fs.readFileSync(fileName, 'utf-8');

  const ast = parser.parse(file, { sourceType: 'module' });

  let dep = [];
  
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dep.push(node.source.value);
    }
  });

  const id = Id++;

  const {code} = transformFromAst(ast, null, {
    presets: ['env']
  })

  return {
    fileName,
    code,
    id,
    dep
  }

}

const assets  = createDependency('./src/main.js');
const queue = [assets];

for(const q of queue){
  q.mapping = {};

  const dirname = path.dirname(q.fileName);

  q.dep.forEach(element => {
    const absPath = path.join(dirname, element);

    const child =  createDependency(absPath);
    q.mapping[absPath] = child.id;
    queue.push(child);
  });
}

console.log(queue);

//'./src/main.js'




