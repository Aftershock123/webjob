function createdcompany(db){
const createTables = `
  CREATE TABLE IF NOT EXISTS companies (
    id_company INT AUTO_INCREMENT PRIMARY KEY,
    password INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    type_levl INT Default 2
    name_company VARCHAR(50) NOT NULL,
    type_company VARCHAR(50) NOT NULL,
    namecontact_company VARCHAR(50) NOT NULL, 
    address_company VARCHAR(100) NOT NULL, 
    province_company VARCHAR(50) NOT NULL, 
    county_company VARCHAR(50) NOT NULL, 
    district_company VARCHAR(50) NOT NULL, 
    zipcode_company int NOT NULL,
    tell_company  int NOT NULL, 
       
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