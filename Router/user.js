
const express = require('express')
const router = express.Router()
const db = require('../Router/db-config');

router.get('/profile', async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await db.query('SELECT * FROM users WHERE id_user = ?', [id]);
      
      res.redirect('/profile.ejs', { user: rows });
    } catch (error) {
      console.log(error);
    }
  });




module.exports = router ;