import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post('/', async(req, res) => {
    try {
        const fileVideo = req.files.mVideo;
        const vttFile= req.files.mVtt;
        const userId = req.cookies.userId;

        const currTime = new Date().getTime().toString(); 

        //save video file
        let fileName = currTime + path.extname(fileVideo.name);
        
        let savePath = path.join(__dirname, '../public','uploads',fileName);
        if (fileVideo.truncated) {
            res.status(400).send('File size too large');
            return;
        }
        if (fileVideo.mimetype !== 'video/mp4' && fileVideo.mimetype !== 'video/mp4') {
            res.status(400).send('File type not supported 1');
            return;
        }
        await fileVideo.mv(savePath);

        //save vtt  file
        fileName = currTime+ path.extname(vttFile.name);
        
        savePath = path.join(__dirname, '../public','uploads',fileName);

        if (vttFile.truncated) {
            res.status(400).send('File size too large');
            return;
        }
        if (vttFile.mimetype !== 'text/vtt') {
            res.status(400).send('File type not supported 2');
            return;
        }
        await vttFile.mv(savePath);

        //save video details to database
        var query = "insert into user_video (`userId`,`videoName`,`subTitleName`) values (?,?,?)";
        pool.query(query,[userId,fileName.split('.')[0]+'.mp4',fileName.split('.')[0]+'.vtt'],(err,result)=>{
            if(err){
                res.status(500).send(err);
            }
            else{
                res.redirect("/");
            }
        });
    } catch (error) {
        res.status(500).send('Error Uploading File');
    }
});

export default router;