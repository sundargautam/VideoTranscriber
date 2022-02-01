// create express route
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/connection.js';
import 'dotenv/config';

const router = express.Router();

router.post('/',async (req,res)=>{
    let email = req.body.email;
    let password = req.body.password;

    //use single connection pool to database query
    pool.query('select * from login where email = ?',[email],(err,result)=>{
        if (err) {
            res.status(500).send(err);
        }
        else{
            if (result.length === 0) {
                res.status(403).send("Invalid email or password"); // email is not found
            }
            bcrypt.compare(password,result[0].password, function(err, bcryptResult) {
                if(err){
                    res.status(500).send(err);
                }
                else{
                    if(bcryptResult){
                        let token = jwt.sign(result[0],process.env.VERY_SECRET_KEY,{expiresIn:'1h'});
                        res.cookie('auth',token);
                        res.cookie('userId',result[0].id);
                        res.redirect('/');
                    }
                    else{
                        res.status(403).send("Invalid email or password"); // password is not correct as bcryptResult is false
                    }
                }
            });
        }
    });
});

export default router;
