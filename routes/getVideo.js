import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/', function(req, res){
    try {
        let file = req.query.videoId;
        console.log(file)
        var stat = fs.statSync(path.join(__dirname,'../public/uploads/'+file)); // location of public folder wrt getVideo.js

        let start = 0;
        let end = 0;
        let range = req.header('Range');
        if (range != null) {
        start = parseInt(range.slice(range.indexOf('bytes=')+6,
            range.indexOf('-')));
        end = parseInt(range.slice(range.indexOf('-')+1,
            range.length));
        }
        if (isNaN(end) || end == 0) end = stat.size-1;

        if (start > end) return;

        res.writeHead(206, { 
        'Connection':'close',
        'Content-Type':'video/mp4',
        'Content-Length':end - start,
        'Content-Range':'bytes '+start+'-'+end+'/'+stat.size,
        'Transfer-Encoding':'chunked'
        });

        let stream = fs.createReadStream(file,
        { flags: 'r', start: start, end: end}); // create read stream opening the file in read only mode
        stream.pipe(res);
    } catch (error) {
        res.status(500).send(error);
    }
});

export default router;
