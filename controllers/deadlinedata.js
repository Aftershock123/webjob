const moment = require('moment');

// Assuming `deadline` is a DATETIME field from your database
const Deadlinedata= async (deadline)=> {
    try{
            const inputDate = moment(deadline).toDate();
            const currentDatetime = new Date();
            return inputDate > currentDatetime;

    } catch (error) {
        console.log(error);
      }
      
}

module.exports = Deadlinedata;