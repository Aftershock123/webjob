function createdjobcompany(db){
    const createTables = `
    CREATE TABLE IF NOT EXISTS job_company (
      idjob_company INT(11) AUTO_INCREMENT PRIMARY KEY,
      name_job VARCHAR(100) NULL,
      role VARCHAR(100) NULL,
      detail_work VARCHAR(1000) NULL,
      experience VARCHAR(1000) NULL,
      gender VARCHAR(100) NULL,
      education VARCHAR(1000) NULL,
      welfare VARCHAR(1000) NULL,
      salary VARCHAR(100) NULL,
      workday VARCHAR(100) NULL,
      day_off VARCHAR(100) NULL,
      deadline_offer DATE NOT NULL,
      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      id_company INT(11) NOT NULL,
      FOREIGN KEY (id_company)
      REFERENCES companies (id_company)
      ON DELETE CASCADE
      ON UPDATE CASCADE
      
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
    module.exports =createdjobcompany;