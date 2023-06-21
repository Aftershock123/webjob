const db = require("../Router/db-config");
const bcrypt = require("bcryptjs");

const registercompany = async (req, res) => {
    const { name: name_company, email, password: Npassword, user_company, type_company, namecontact_company, address_company, province_company, county_company, district_company, zipcode_company, tell_company } = req.body;
    if (!email || !Npassword) {
        return res.status(401).json({ status: "error", error: "Please enter your email and password" });
    } else {
        console.log(email);
        console.log(name_company);
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
                    
                    db.query('INSERT INTO members SET ?', { email: email, password: password }, (error, results) => {
                        if (error) {
                            console.log("Insert member error");
                            throw error;
                        }
                        
                        // const memberId = memberResult.insertId;
                        
                        db.query('INSERT INTO companys SET ?', { user_company: user_company, password: password, name_company: name_company, type_company: type_company, namecontact_company: namecontact_company, address_company: address_company, province_company: province_company, county_company: county_company, district_company: district_company, zipcode_company: zipcode_company, tell_company: tell_company, email: email, id_member:  results.insertId }, (error, companyResult) => {
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
};

module.exports = registercompany;
