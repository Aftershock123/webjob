function createdcompany(db){
const createTables = `
  CREATE TABLE IF NOT EXISTS companies (
    id_company INT(11) AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    name_company VARCHAR(100) NOT NULL,
    type_company VARCHAR(100) NOT NULL,
    namecontact_company VARCHAR(100) NOT NULL, 
    address_company VARCHAR(1000) NOT NULL, 
    province_company VARCHAR(100) NOT NULL, 
    county_company VARCHAR(100) NOT NULL, 
    district_company VARCHAR(100) NOT NULL, 
    zipcode_company INT(11) NOT NULL,
    tell_company  INT(11) NOT NULL,
    image VARCHAR(100) NOT NULL,
    token VARCHAR(100) NOT NULL       
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
module.exports =createdcompany;