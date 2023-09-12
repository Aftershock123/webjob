const nodemailer =require('nodemailer');

const sendMail = async (email,mailSubject ,content) =>{
    try{
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: 'Andrew.ColtOoO@gmail.com',
              pass: 'obap znvj sdee nsds',
            },
          });
       
            const mailOptions = {
              from: 'Andrew.ColtOoO@gmail.com',
              to: email,
              subject: mailSubject,
              htmal: content,
            };
          
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                // res.send('Failed to send verification email.');
              } else {
                console.log('Email sent: ' + info.response);
                // res.send('Verification email sent successfully.');
              }
            });
    }
    catch(error){

    }
}

module.exports = sendMail;






