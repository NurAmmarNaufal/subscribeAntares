var express = require("express");
var app = express();
var server = require("http").createServer(app);
var bodyParser = require("body-parser");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const algoritma = require('./algoritma')
app.post("/uhui/aha", algoritma);

app.get('/', (req, res) => {
  res.send("Halo api antares :)")
})

server.listen(process.env.PORT || 80, function () {
  console.log("App on port 80");
});
