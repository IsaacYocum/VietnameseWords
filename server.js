const express = require('express');
const app = express();
const fs = require('fs');
const server = app.listen(3000, () => {
    console.log("Server listening on port: " + server.address().port)
});

app.use(express.static('public'));
app.use(express.json())

app.post('/newWord', (req, res) => {
    console.log(req.body)
})





