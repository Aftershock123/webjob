function createdresume(db){
    const createTables = `
      CREATE TABLE IF NOT EXISTS resume (
        id_resume INT(11) AUTO_INCREMENT PRIMARY KEY,
        professional_summary VARCHAR(1000)  NULL,
        work_experience VARCHAR(1000)  NULL,
        skills VARCHAR(1000)  NULL,
        education VARCHAR(1000) NULL,
        languages VARCHAR(1000)  NULL,
        interests VARCHAR(1000)  NULL,
        contact VARCHAR(1000)  NULL, 
        id_user INT(11)  NULL,
        FOREIGN KEY (id_user)
        REFERENCES users (id_user)
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
    module.exports =createdresume;