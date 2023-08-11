function createduser(db){


const createTables = `
  CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    password INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    type_levl INT Default 1
  );

`;

db.query(createTables, err => {
  if (err) {
    console.error('Error creating tables:', err);
    return;
  }
  console.log('Tables created');
});
}
module.exports =createduser;