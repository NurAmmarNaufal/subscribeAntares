const axios = require("axios");

const algoritma = async (req, res) => {
    let data = req.body
    let devEui = ""
  
    if (data["m2m:sgn"]["m2m:vrq"]) {
      console.log(data["m2m:sgn"]["m2m:vrq"]);
    } else {
      console.log("masuk");
      console.log(data);
      let aha = JSON.parse(
        data["m2m:sgn"]["m2m:nev"]["m2m:rep"]["m2m:cin"]["con"]
      );
      console.log("convert");
      console.log(aha);
      console.log("HEX DATA");
  
      let dataHex = aha.data
      devEui = aha.devEui
  
      if (dataHex.length === 36 && devEui === '8cf9572000092ac1') {
  
        //flow
        let batHex = dataHex.slice(6, 8);
        let tmpHex = dataHex.slice(10, 12) + dataHex.slice(8, 10);
        let flowHex = dataHex.slice(34) + dataHex.slice(32, 34) + dataHex.slice(30, 32) + dataHex.slice(28, 30)
                    + dataHex.slice(26, 28) + dataHex.slice(24, 26) + dataHex.slice(22, 24) + dataHex.slice(20, 22)
  
        let bat = parseInt(batHex, 16)
        let tmp = parseInt(tmpHex, 16) / 100
        let flow = parseInt(flowHex, 16) / 1000
  
        console.log("devEui > " + devEui);
        console.log("ula > " + dataHex);
        console.log("bat > " + batHex + " " + bat + "%");
        console.log("tmp > " + tmpHex + " " + tmp + "°C");
        console.log("flow > " + flowHex + " " + flow + "L");
  
        await axios.post("http://api.siagaairbersih.com/v1/device/katara/", {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOjIxM30.iI0d6yHJzUpX4Tj0STqkiN14Xzy2BEdG3npkLga9XO8",
          flow: flow,
        });
      }
    }
    res.send("ack");
}

module.exports = algoritma