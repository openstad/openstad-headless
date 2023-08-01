let userMapping = JSON.stringify({ identifier: 'id', name: 'user => `${user.name}`' });
console.log(userMapping);

let user = { id: 3, name: 'Niels' }

try {
  userMapping = JSON.parse(userMapping)
  console.log(userMapping);
} catch(err) {
  console.log(err);
}

try {
  let identifier = eval(userMapping.identifier);
  console.log(identifier);
  let name = eval(userMapping.name);
  console.log(name);
} catch(err) {
  console.log(err);
}

console.log('----------');
