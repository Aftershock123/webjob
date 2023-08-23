function  createdadmin (db){
    const createTables = `
    CREATE TABLE IF NOT EXISTS admins (
      id_admin INT(11) AUTO_INCREMENT PRIMARY KEY,
      password VARCHAR(100) NOT NULL,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      type_level INT(11) Default '3'
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

module.exports = createdadmin;


