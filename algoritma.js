const axios = require("axios");
const pool = require("./config/db");

const algoritma = async (req, res) => {
  let data = req.body;
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (data["m2m:sgn"]["m2m:vrq"]) {
    console.log(data);
    res.send("ack");
  } else if (data["m2m:sgn"]["m2m:nev"]["m2m:rep"]["m2m:cin"]) {
    const db = await (await pool.query("SELECT * FROM identitas_lora")).rows[0];

    let dataLora = JSON.parse(
      data["m2m:sgn"]["m2m:nev"]["m2m:rep"]["m2m:cin"]["con"]
    );

    console.log(dataLora);
    console.log("HEX DATA");

    let devEuiLora = dataLora.devEui.toLowerCase();
    let devEuiDB = db.deveui.toLowerCase();

    let dataHex = dataLora.data;

    if (devEuiDB === devEuiLora) {
      if (dataHex.length === 36) {
        let batHex = dataHex.slice(6, 8);
        let tmpHex = dataHex.slice(10, 12) + dataHex.slice(8, 10);
        let volumeHex =
          dataHex.slice(34) +
          dataHex.slice(32, 34) +
          dataHex.slice(30, 32) +
          dataHex.slice(28, 30) +
          dataHex.slice(26, 28) +
          dataHex.slice(24, 26) +
          dataHex.slice(22, 24) +
          dataHex.slice(20, 22);

        let bat = parseInt(batHex, 16);
        let tmp = parseInt(tmpHex, 16) / 100;
        let volume = parseInt(volumeHex, 16) / 1000;

        console.log("devEuiLora > " + devEuiLora);
        console.log("ula > " + dataHex);
        console.log("bat > " + batHex + " " + bat + "%");
        console.log("tmp > " + tmpHex + " " + tmp + "°C");
        console.log("volume > " + volumeHex + " " + volume + "L");

        await pool.query(
          `
            INSERT INTO
                data_lora(
                    deveui,
                    battery,
                    temperature,
                    volume,
                    bulan,
                    tahun,
                    created_at
                )
            VALUES
            ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `,
          [
            devEuiLora,
            bat,
            tmp,
            volume,
            month,
            year,
            Date.now()
          ]
        );
      }
      console.log('data < 36')
    }
  }
};

module.exports = algoritma;
