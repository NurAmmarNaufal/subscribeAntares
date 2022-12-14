var express = require("express");
var app = express();
var server = require("http").createServer(app);
var bodyParser = require("body-parser");
require('dotenv').config()


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const algoritma = require('./algoritma')
app.post("/uhui/aha", algoritma);

const algo = require('./algo')
app.post("/uhui/ulala", algo);

const db = require('./cekdb')
app.get("/uhui/db/", db);


// const ifTodayDate1 = require('./controller/ifTodayDate1')

app.get('/', (req, res) => {
  res.json("Halo 👋, ini API lora antares SIAB :)")
})

server.listen(process.env.PORT || 8000, function () {
  console.log("App on port 8000");
});
