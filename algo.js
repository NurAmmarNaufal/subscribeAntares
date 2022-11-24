const algo = async (req, res) => {
  let data = req.body;

  if (data["m2m:sgn"]["m2m:vrq"]) {
    console.log(data);
  } else if (data["m2m:sgn"]["m2m:nev"]["m2m:rep"]["m2m:cin"]) {
    
    let dataLora = JSON.parse(
      data["m2m:sgn"]["m2m:nev"]["m2m:rep"]["m2m:cin"]["con"]
    );

    console.log(data);
    console.log(dataLora.data.length);
  }
  res.send("ack");
};

module.exports = algo;
