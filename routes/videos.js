import express, { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../database/connection.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/', (req, res) => {
    const userId = req.cookies.userId;
    let query = "select * from user_video where userId = ?"; // return only the videos of the logged in user
    //using single connection pool to avoid multiple connections
    pool.query(query,[userId],(err,result)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            res.send(result);
        }
    });
})

router.patch('/',(req,res)=>{
    const videoName = req.query.videoName;
    let query = "update user_video set isPublic = !isPublic where videoName = ?"; // invert value of isPublic field
    //using single connection pool to avoid multiple connections
    pool.query(query,[videoName],(err,result)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            res.send(result);
        }
    });
});

router.delete('/',(req,res)=>{
    const videoName = req.query.videoName;
    let fileName = videoName.split('.')[0];
    let query = "delete from user_video where videoName = ?";
    pool.query(query,[videoName],(err,result)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            try {
                //synchronous code to block the code execution until the file is deleted
                fs.unlinkSync(path.join(__dirname,'../public/uploads/'+fileName+'.mp4')); // delete video file 
                fs.unlinkSync(path.join(__dirname,'../public/uploads/'+fileName+'.vtt')); // delete vtt file
                res.send(result);
            } catch (error) {
                res.status(500).send(error);
            }
        }
        
    });
})
export default router;