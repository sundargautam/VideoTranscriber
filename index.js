import express from 'express'
import path from 'path';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url'; //import url so that we can use __dirname and __filename which are not present in ECMAScript Module
import 'dotenv/config';

import login from './routes/login.js';
import logout from './routes/logout.js';
import signup from './routes/signup.js';
import videos from './routes/videos.js';
import getVideo from './routes/getVideo.js';
import upload from './routes/upload.js';

let app =express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// use bodyParser and cookie parser as middleware
app.use(bodyParser.json());
app.use(cookieParser())


// view engine as ejs so that ejs files can be rendered
app.set('view engine', 'ejs');

// use express-fileupload as middleware
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'tmp'),
    createParentPath:true,
    limits: { fileSize: 50 * 1024 * 1024 }
}));

//serve static files from public folder
app.use(express.static(path.join(__dirname,'public')));

//UI routes and serving static js files
app.get('/',jwtVerify, (req, res) => {
    res.render('index.ejs');
})
app.get('/login', (req, res) => {
    res.render('login.ejs');
})
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
})
app.get('/myUploads', (req, res) => {
    res.render('myUploads.ejs');
})
app.get('/main.js', (req, res) => {
    res.sendFile(path.join(__dirname,'./javascript/main.js'));
})
app.get('/uploads.js', (req, res) => {
    res.sendFile(path.join(__dirname,'./javascript/uploads.js'));
})

//API routes
app.use('/api/upload',jwtVerify, upload);
app.use('/api/login',login);
app.use('/api/logout',logout);
app.use('/api/signup',signup);
app.use('/api/videos',jwtVerify,videos);
app.use('/api/getVideo',jwtVerify,getVideo);

//start express server
app.listen(process.env.SERVER_PORT, () => console.log(`Server started on port ${process.env.SERVER_PORT}`));


//verify incoming JWT token is valid one
function jwtVerify (req, res, next) {
    let token = req.cookies.auth;
    if (token) {
        jwt.verify(token,process.env.VERY_SECRET_KEY,(err,decoded)=>{
            if (err) {
                res.status(403).redirect('/login');
            }
            else{
                req.userId = decoded.id;
                next();
            }
        });
    }
    else{
        res.status(403).redirect('/login');
    }
}