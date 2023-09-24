const nodemailer =require('nodemailer');
const path =require('path')
const ejs =require('ejs')

const sendrepass = async (email,mailSubject ,content) =>{
    try{
      
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: 'Andrew.ColtOoO@gmail.com',
              pass: 'obap znvj sdee nsds',
            },
          });
          const TemplatePath = path.join(__dirname, "../views/resetpass.ejs");
          const data =await ejs.renderFile(TemplatePath,{content});
          // console.log(data)
          // console.log(content)
            const mailOptions = {
              from: 'Andrew.ColtOoO@gmail.com',
              to: email,
              subject: mailSubject,
              html: data,

              
            };
          
            transporter.sendrepass(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                // res.send('Failed to send verification email.');
              } else {
                console.log('Email sent: ' + info.response);
                
                
              }
            });
    }
    catch(error){

    }
}

module.exports = sendrepass;






