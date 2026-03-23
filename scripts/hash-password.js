const bcrypt = require('bcrypt');

const password = process.argv[2] || 'password';

bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
});