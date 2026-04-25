const bcrypt = require('bcryptjs');

bcrypt.hash("admin123", 10).then(hash => {
    console.log(hash);
});
// Hashed Password for "admin123" is: $2b$10$KGKoIIfc0YbNDyyPMfU4TO39avpn7crj.Vllh.myzBQecZZ8rUxw.