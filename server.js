const express = require('express');
const Datastore = require('nedb');
const app = express();
const db = new Datastore('words.db');

app.listen(3000, () => console.log("Server listening on port: "));
app.use(express.static('public'));
app.use(express.json())

db.loadDatabase();

app.post('/newWord', (req, res) => {
    db.insert(req.body, (err) => {
        if (err) {
            console.log(err);
            res.end();
            return;
        }
        res.send({status: 'Successful'});
    })
})

app.post('/updateTrans', (req, res) => {
    console.log(req.body)
    db.update({_id: req.body._id}, req.body, (err) => {
        if (err) {
            console.log(err);
            res.end();
            return;
        }
        res.send({status: 'Successful'});
    })
})

app.get('/deleteWord', (req, res) => {
    db.remove({_id: req.query.delId}, (err) => {
        if (err) {
            console.log(err);
            res.end();
            return;
        }
        res.send({status: 'Success'})
    })
})

app.get('/getAllWords', (req, res) => {
    db.find({}, (err, docs) => {
        if (err) {
            res.end();
            return;
        }
        res.send(docs);
    })
})

app.get('/getRandomWord', (req, res) => {
    db.find({}, (err, docs) => {
        if (err) {
            res.end();
            return;
        }
        let rand = Math.floor(Math.random() * Math.floor(docs.length));
        res.send([docs[rand]]);
    })
})







