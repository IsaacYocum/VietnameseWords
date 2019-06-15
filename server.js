const express = require('express');
const Datastore = require('nedb');
const app = express();
const db = new Datastore('words.db');

const server = app.listen(3000, () => console.log("Server listening on port: " + server.address().port));
app.use(express.static('public'));
app.use(express.json());

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
    db.update({_id: req.body._id}, req.body, (err) => {
        if (err) {
            console.log(err);
            res.end();
            return;
        }
        res.send({status: 'Successful'});
    });
});

app.get('/deleteWord', (req, res) => {
  let ids = req.query.delId;
  for (let id = 0; id < ids.length; id++) {
    db.remove(ids[id], (err) => {
        if (err) {
            console.log(err);
            res.end();
            return;
        };
    });
  };
  res.send(ids);
});

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
    });
});

app.get('/search', (req, res) => {
    let lang = req.query.lang;
    let st = new RegExp(req.query.st);

    var toFind = {};
    if (lang === 'viet') {
        toFind.viet = st;
    } else {
        toFind.eng = st;
    };

    db.find(toFind, (err, docs) => {
        if (err) {
            res.end();
            return;
        }
        res.send(docs);
    });
});