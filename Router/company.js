const db =require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express =require("express");
const router =express.Router();

router.post('/registercompany' , async (req, res) => {
    const { username: username, password: Npassword, name_company, type_company, namecontact_company, address_company, province_company, county_company, district_company, zipcode_company, tell_company , email} = req.body;
    if (!email || !Npassword) {
        return res.status(401).json({ status: "error", error: "Please enter your email and password" });
    } else {
        console.log(email);
        console.log(username);
        db.query('SELECT email FROM members WHERE email = ?', [email], async (err, result) => {
            if (err) throw err;
            if (result[0]) {
                return res.json({ status: "error", error: "Email has already been registered" });
            } else {
                try {
                    // Logging the original password before hashing
                    console.log(Npassword);
                
                    // Hashing the password
                    const password = await bcrypt.hash(Npassword, 8);
                    
                    db.query('INSERT INTO members SET ?', { username:username, email: email, password: password }, (error, results) => {
                        if (error) {
                            console.log("Insert member error");
                            throw error;
                        }
                        
                        // const memberId = memberResult.insertId;
                        
                        db.query('INSERT INTO companys SET ?', { username: username, password: password, name_company: name_company, type_company: type_company, namecontact_company: namecontact_company, address_company: address_company, province_company: province_company, county_company: county_company, district_company: district_company, zipcode_company: zipcode_company, tell_company: tell_company, email: email, id_member:  results.insertId }, (error, companyResult) => {
                            if (error) {
                                console.log("Insert company error");
                                throw error;
                            }
                            
                            console.log(name_company);
                            console.log(email);
                            console.log(password);
                            
                            return res.status(200).json({ status: "success", success: "User has been registered" });
                        });
                    });
                } catch (error) {
                    console.log("Internal server error");
                    return res.status(500).json({ status: "error", error: "Internal server error" });
                }
            }
        });
    }
});


//พอเริ่มมีคำสั่งที่วับซ้อนจะต้องใช้promise ในที่นี้คือinner joinและใช้async
router.get('/profile/:id', async (req, res) => {
    try {
      const {id} = req.params;
      console.log(id);
  
      const [rows] = await db.promise().query('SELECT * FROM members INNER JOIN companys ON members.id_member = companys.id_member where members.id_member = ?', [id]);
      console.log(rows);
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.render('profile', { user: rows[0] });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


  router.post('/updateprofile/:id', async (req, res) => {
    try {
      const {id} = req.params;
      console.log(id);
      const {username,email}= req.body;
      console.log(req.body);
      
      const [rows] = await db.promise().query('UPDATE companys SET username = ?, email = ? WHERE users.id_member = ?', [username, email, id]);
      console.log(rows);
      const [rows2] = await db.promise().query('UPDATE members SET username = ?, email = ? WHERE members.id_member = ?', [username, email, id]);
      if (rows.length === 0 && rows2.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/user/profile/' + id);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });



  
  //เหมือนกับ resume
    router.get('/job_company/:id', async (req, res) => {
      try {
        const {id} = req.params;
        console.log(id);
    
        const [rows] = await db.promise().query('SELECT * FROM job_company INNER JOIN companys ON job_company.id_company = companys.id_company where job_company.id_company = ?', [id]);
        console.log(rows);
        if (rows.length === 0) {
          return res.status(404).send('User not found');
        }
    
        res.render('jobcompany', { job: rows[0] ,company: rows[0] });
    
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });
  
  router.post('/addjob_company/:id', async (req, res) => {
    try {
      const {id} = req.params;
      console.log(id);
      const {name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer}= req.body;
      console.log(req.body);
      // const [rows] = await db.promise().query('UPDATE job_company SET name_job = ?, role = ?, detail_work = ?, experience = ?, gender = ?, education = ?, welfare = ?, salary = ?, workday = ?, day_off = ?, deadline_offer = ?,id = ? WHERE  idjob_company and job_company.id_company = ?', [ name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer,id]);
      const [rows] = await db.promise().query('INSERT INTO job_company SET ?', { name_job: name_job, role: role, detail_work: detail_work, experience: experience, gender: gender, education: education, welfare: welfare, salary: salary, workday: workday, day_off: day_off, deadline_offer: deadline_offer,id_company: id}, (error, results) => {  
    });
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/company/job_company/' + id);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });



  router.post('/updatejob_company/:id', async (req, res) => {
    try {
      const {id} = req.params;
      console.log(id);
      const {name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer}= req.body;
      console.log(req.body);
      const [rows] = await db.promise().query('UPDATE job_company SET name_job = ?, role = ?, detail_work = ?, experience = ?, gender = ?, education = ?, welfare = ?, salary = ?, workday = ?, day_off = ?, deadline_offer = ?,id = ? WHERE  idjob_company and job_company.id_company = ?', [ name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer,id]);
    //   const [rows] = await db.promise().query('INSERT INTO job_company SET ?', { name_job: name_job, role: role, detail_work: detail_work, experience: experience, gender: gender, education: education, welfare: welfare, salary: salary, workday: workday, day_off: day_off, deadline_offer: deadline_offer,id_company: id}, (error, results) => {  
    // });
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/company/job_company/' + id);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });






//ทำค้นหาด้วยชื่อcompany and job by id 
  // router.get('/companyandjob/', async (req, res) => {
  //   try {
  //     const {id} = req.params;
  //     console.log(id);
  
  //     const [rows] = await db.promise().query('SELECT * FROM job_company INNER JOIN companys ON members.id_member = companys.id_member where members.id_member = ?', [id]);
  //     console.log(rows);
  //     if (rows.length === 0) {
  //       return res.status(404).send('User not found');
  //     }
  
  //     res.render('jobcompany', { job: rows[0] });
  
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // });




  //ค้นหาตำแหน่งงาน
    // router.get('/companyandjob/:id', async (req, res) => {
  //   try {
  //     const {id} = req.params;
  //     console.log(id);
  
  //     const [rows] = await db.promise().query('SELECT * FROM job_company INNER JOIN companys ON members.id_member = companys.id_member where members.id_member = ?', [id]);
  //     console.log(rows);
  //     if (rows.length === 0) {
  //       return res.status(404).send('User not found');
  //     }
  
  //     res.render('jobcompany', { job: rows[0] });
  
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // });


module.exports= router;