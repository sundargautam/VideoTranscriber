import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../database/connection.js';

const router = express.Router();

router.post('/',(req,res)=>{
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    let regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/g; //regex to validate password
    if (!password.match(regex)) {
        res.status(500,"Password must contain at least one uppercase letter, one lowercase letter, one number and one special character");
        return;
    }
    //hash password using bcrypt
    let saltRounds = 10;
    bcrypt.hash(password, saltRounds, function(err, hashedPassword) {
        var query = "insert into login (`username`,`email`,`password`) values (?,?,?)";
        pool.query(query,[username,email,hashedPassword],(err,result)=>{
            if(err){
                res.status(500).send(err);
            }
            else{
                res.redirect("/");
            }
        });
    });
});

export default router;