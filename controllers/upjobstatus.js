const db = require("../Router/db-config");

const updatejobstatus = async () => {
  try {
    const currentTime = new Date();

    const [results] = await db.promise().query('SELECT idjob_company, deadline_offer, statusjob FROM job_company');

    if (results && Array.isArray(results)) {
      results.forEach(async (job) => {
        const maturityDatetime = new Date(job.deadline_offer);
        if (maturityDatetime < currentTime && job.status !== 'closejob') {
          try {
            await db.promise().query('UPDATE job_company SET statusjob = ? WHERE idjob_company = ?', ['closejob', job.idjob_company]);
            await db.promise().query(" UPDATE  historyuser SET statushis =0 WHERE idjob_company = ? ", [job.idjob_company]);
            console.log(`อัปเดตสถานะ job id ${job.idjob_company} เรียบร้อยแล้ว`);
          } catch (updateError) {
            console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ job:', updateError);
          }
        }
      });
  }  else {
    console.error('ไม่พบข้อมูลจากคำสั่ง SQL');
  }
}catch (errors) {
    console.log(errors);
  }
};

module.exports = updatejobstatus;
