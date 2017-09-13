const express = require("express");
const app = express();
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const fs = require('fs');
const spicedPg = require('spiced-pg');
const bodyParser = require("body-parser");
const db = spicedPg(process.env.DATABASE_URL || 'postgres:postgres:password@localhost:5432/signatures');
const myUrl = require("./config.json");
app.use(bodyParser());

const diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + "/uploads");
    },
    filename: (req, file, callback) => {
        uidSafe(24).then((uid) => {
            console.log(uid + path.extname(file.originalname));
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 20097152
    }
});

const knox = require('knox');
let secrets;
// if (process.env.NODE_ENV == 'production') {
//     secrets = process.env; // in prod the secrets are environment variables
// } else {
secrets = require('./secrets.json'); // secrets.json is in .gitignore
// }

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'olofsbuckett'
});

function insertImage(image, user, title, description) {
    return new Promise((resolve, reject) => {
        var query = "INSERT INTO images (image, username, title, description) VALUES ($1,$2,$3,$4)";

        db.query(query, [image.filename, user, title, description]).then(() => {
            resolve(image.filename);
        }).catch((err) => {
            reject(err);
        });
    });
}


app.use(express.static(__dirname + '/public'));

app.get("/images", (req, res) => {
    var query = "SELECT * FROM images ORDER BY id DESC LIMIT 12";
    db.query(query).then((results) => {
        var JSONtingting = {
            name: []
        };
        for (var i = 0; i < results.rows.length; i++) {
            results.rows[i].url = require("./config.json").s3Url + results.rows[i].image;
            JSONtingting.name.push(results.rows[i]);
        }
        res.send(JSONtingting);

    });
});

app.get("/image/:id", (req, res) => {
    var query = "SELECT * FROM images WHERE id = $1";
    db.query(query, [req.params.id]).then((results) => {

        var JSONtingting = {
            name: [],
            comments: []
        };
        for (var i = 0; i < results.rows.length; i++) {
            results.rows[i].url = require("./config.json").s3Url + results.rows[i].image;
            JSONtingting.name.push(results.rows[i]);
        }
        db.query("SELECT * FROM comments WHERE image_id = $1 ORDER BY id DESC", [req.params.id]).then((results) => {
            for (var i = 0; i < results.rows.length; i++) {
                JSONtingting.comments.push(results.rows[i]);
            }
            console.log(JSONtingting);
            res.send(JSONtingting);


        });



    });
    // res.json(response);

});

app.post('/upload', uploader.single('file'), (req, res) => {
    console.log(req.body);

    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });

    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', (s3Response) => {
        console.log(s3Response.statusCode);
        // const wasSuccessful = s3Response.statusCode == 200;
        // res.json({
        //     success: wasSuccessful
        // });
        if (s3Response.statusCode == 200) {
            console.log(req);
            insertImage(req.file, req.body.user, req.body.title, req.body.description).then((url) => {
                res.redirect("#images");
                console.log(myUrl.s3Url + url);
            }).catch((err) => {
                console.log(err);
            });
        }
    });

});

app.post('/comment', (req, res) => {

    db.query("INSERT INTO comments (image_id, username, comment) VALUES ($1,$2,$3)", [req.body.image_id, req.body.user, req.body.comment]).then((results) => {
        res.json({comment:req.body.comment,image_id:req.body.image_id,user:req.body.user});
        // res.json([req.body.comment,req.body.image_id,req.body.user]);

    });

});


app.listen(8080, () => {
    console.log("im listening yo");
});
