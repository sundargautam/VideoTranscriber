// create express route
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/connection.js';
import 'dotenv/config';

const router = express.Router();

router.get('/',async (req,res)=>{

    //clear all cookies so that auth value is not available in the next request
    res.cookie('auth','');
    res.cookie('userId','');
    res.redirect('/login');
});

export default router;
