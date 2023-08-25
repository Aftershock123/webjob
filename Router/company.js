const db =require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express =require("express");
const router =express.Router();
const loggedIn =require("../controllers/loggedin")

router.post('/registercompany' , async (req, res) => {
  const { username: username, password: Npassword, name_company, type_company, namecontact_company, address_company, province_company, county_company, district_company, zipcode_company, tell_company , email} = req.body;
  if (!email || !Npassword) {
      return res.status(401).json({ status: "error", error: "Please enter your email and password" });
  } else {
      db.query('SELECT email FROM companies WHERE email = ?', [email], async (err, result) => {
          if (err) throw err;
          if (result[0]) {
              return res.json({ status: "error", error: "Email has already been registered" });
          } else {
              try {
                  // Hashing the password
                  const password = await bcrypt.hash(Npassword, 8);

                      db.query('INSERT INTO companies SET ?', { username: username, password: password, name_company: name_company, type_company: type_company, namecontact_company: namecontact_company, address_company: address_company, province_company: province_company, county_company: county_company, district_company: district_company, zipcode_company: zipcode_company, tell_company: tell_company, email: email }, (error, companyResult) => {
                          if (error) {
                              console.log("Insert company error");
                              throw error;
                          } 
                          return res.status(200).json({ status: "success", success: "User has been registered" });
                      });
                  
              } catch (error) {
                  console.log("Internal server error");
                  return res.status(500).json({ status: "error", error: "Internal server error" });
              }
          }
      });
  }
});
//--------------------------------------------- profile------------------------------------------------------

router.get('/profile/:id', loggedIn, async (req, res) => {
    try {
      const {id} = req.params;
      
      const [rows] = await db.promise().query('SELECT * FROM companies  where id_company = ?', [id]);
      
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.render('profile', { company: rows[0] ,user,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


  router.post('/updateprofile/:id', loggedIn, async (req, res) => {
    try {
      const {id} = req.params;
      
      const {username,email}= req.body;
      
      const [rows] = await db.promise().query('UPDATE companies SET username = ?, email = ? WHERE companies.id_company = ?', [username, email, id]);
      const [updatedCompany] = await db.promise().query('SELECT * FROM companies WHERE id_company = ?', [id]);// console.log(rows);
       if (rows.length === 0 ) {
        return res.status(404).send('companies not found');
      }
  
      res.render('profile', { company: updatedCompany[0] ,user,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

//-----------------------------------------------------------job-------------------------------

  //เพิ่มเส้จไปหน้าjoball
  
    router.get('/addjob_company/:id', loggedIn, async (req, res) => {
      try {       
        const {id} = req.params;

        const [rows] = await db.promise().query('SELECT * FROM companies  where id_company = ?', [id]);
        
        if (rows.length === 0) {
          return res.status(404).send('User not found');
        }
        res.render('addjob', { company: rows[0] ,user,admin});
    
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });
  
  router.post('/addjob_company/:id', loggedIn, async (req, res) => {
    try {
      const {id} = req.params;

      const {name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer}= req.body;

      const [rows] = await db.promise().query('INSERT INTO job_company SET ?', { name_job: name_job, role: role, detail_work: detail_work, experience: experience, gender: gender, education: education, welfare: welfare, salary: salary, workday: workday, day_off: day_off, deadline_offer: deadline_offer,id_company: id});
      
      const [updatedCompany] = await db.promise().query('SELECT * FROM companies  where id_company = ?', [id]);
    
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
       res.render('addjob', { job: rows[0] ,company: updatedCompany[0] ,user,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


  router.get('/updatejob_company/:id', loggedIn, async (req, res) => {
    try {
      const {id} = req.params;

      const [rows] = await db.promise().query('SELECT * FROM job_company  INNER JOIN companys ON job_company.id_company = companys.id_company where job_company.id_company = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
      
      res.render('updatejob',{company:rows[0],job:rows[0]});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/updatejob_company/:id/:id', loggedIn, async (req, res) => {
    try {
      const {id} = req.params;

      const {name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer}= req.body;
      
      const [rows] = await db.promise().query('UPDATE job_company SET name_job = ?, role = ?, detail_work = ?, experience = ?, gender = ?, education = ?, welfare = ?, salary = ?, workday = ?, day_off = ?, deadline_offer = ?,id = ? WHERE  idjob_company job_company.id_company = ?', [ name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer,id]);
    
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/company/updatejob_company/' + id);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });




  router.get('/joball/:id', loggedIn, async (req, res) => {
    try {
      const {id} = req.params; 

      const [rows] = await db.promise().query('SELECT * FROM job_company  inner join companies  on job_company.id_company = companies.id_company where  job_company.id_company = ?', [id]);

      const [Company] =await db.promise().query('SELECT * FROM companies where id_company =?',[id] );
      
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
      
      res.render('jobgetall',{company:Company[0],job:rows,user,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


  router.get('/jobbyidjob/:id', loggedIn, async (req, res) => {
    try {
      let user;
      let admin;
      const {id} = req.params; 

      const [rows] = await db.promise().query('SELECT * FROM job_company  inner join companies  on job_company.id_company = companies.id_company where  job_company.idjob_company = ?', [id]);

      const [Company] =await db.promise().query('SELECT * FROM companies where id_company =?',[id] );
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
      
      res.render('jobgetall',{company:Company[0],job:rows,user,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

//---------------------------------------------- ค้นหา-------------------------------------------------
  router.post('/searchcompany', loggedIn, async (req, res) => {
    try {
      const search= req.body.searchcompany;
      console.log(search)
  
      let [rows] = await db.promise().query('SELECT * FROM companies where username like "%'+search+'%"');
      console.log(rows)
      var data=[];
      for(i=0;i<rows.length;i++)
      {
          data.push(rows[i]);
      }
      res.send(JSON.stringify(data));
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });




  // ค้นหาตำแหน่งงาน
    router.post('/searchjob', loggedIn, async (req, res) => {
    try {
     
  
      const [rows] = await db.promise().query('SELECT * FROM job_company where name_job like ?', ['%${searchjob}%'],(err,result));
      console.log(rows);
      // res.send(result);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


module.exports= router;