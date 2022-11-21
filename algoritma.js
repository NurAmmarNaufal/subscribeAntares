const axios = require("axios");
const pool = require("./config/db");

const algoritma = async (req, res) => {
  let data = req.body;
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (data["m2m:sgn"]["m2m:vrq"]) {
    console.log(data);
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
        let volume = parseInt(volumeHex, 16); //ml

        console.log("devEuiLora > " + devEuiLora);
        console.log("ula > " + dataHex);
        console.log("bat > " + batHex + " " + bat + "%");
        console.log("tmp > " + tmpHex + " " + tmp + "°C");
        console.log("volume > " + volumeHex + " " + volume + "ml");

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
          [devEuiLora, bat, tmp, volume, month, year, Date.now()]
        );
        axios({
          method: "post",
          url: "http://api.siagaairbersih.com/v1/device/katara/",
          data: {
            flow: volume,
            token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOjIxM30.iI0d6yHJzUpX4Tj0STqkiN14Xzy2BEdG3npkLga9XO8",
          },
        });

        //imput data if to day is date 1
        const date = new Date();

        if (date.getDate() === 1) {
          let mon = date.getMonth();
          let mon2 = mon - 1;
          let year = date.getFullYear();

          if (mon + 1 === 1) {
            mon2 = mon;
            mon = 12;
            year = year - 1;
          }

          const identitas = await (await pool.query(`SELECT * FROM identitas_lora WHERE deveui = '${devEuiLora}'`)).rows[0];

          let pg = await (
            await pool.query(
              `
                SELECT bulan, max(volume) as last FROM (
                  SELECT * FROM data_lora WHERE bulan = ${mon} AND tahun = '${year}' AND deveui = '${devEuiLora}'
                  UNION
                  SELECT * FROM data_lora WHERE bulan = ${mon2} AND tahun = '${year}' AND deveui = '${devEuiLora}'
                ) as new
                GROUP BY bulan 
                ORDER BY last DESC
              `
            )
          ).rows;
          const miliLiter = parseInt(pg[0].last) - parseInt(pg[1].last)
          const liter = miliLiter / 1000
          const totalKubik = liter / 1000
          
          const getPrice = await pool.query(
            `
                SELECT * FROM progresif WHERE kelompok = $1 AND golongan = $2 AND kota = $3 AND ukuran = $4
              `,
            [kelompok, golongan, kota, ukuran]
          )
      
          let priceIn = 0,
            bill = 0,
            price = {}
          let x1 = 0,
            x2 = 0,
            x3 = 0,
            x4 = 0
      
          let tarif1 = getPrice.rows[0].tarif1
          let tarif2 = getPrice.rows[0].tarif2
          let tarif3 = getPrice.rows[0].tarif3
          let tarif4 = getPrice.rows[0].tarif4
      
          let beban_tetap = getPrice.rows[0].beban_tetap
          let kelas1 = getPrice.rows[0].limit1.split('-')
          let kelas2 = getPrice.rows[0].limit2.split('-')
          let kelas3 = getPrice.rows[0].limit3.split('-')
      
          if (totalKubik >= kelas1[0] && totalKubik <= kelas1[1]) {
            priceIn = 1
            bill = totalKubik * tarif1 + beban_tetap
          } else if (totalKubik > kelas1[1] && totalKubik <= kelas2[1]) {
            priceIn = 2
            x1 = kelas1[1] * 1
            x2 = totalKubik - x1
            bill = x1 * tarif1 + x2 * tarif2 + beban_tetap
          } else if (totalKubik > kelas2[1] && totalKubik <= kelas3[1]) {
            priceIn = 3
            x1 = kelas1[1] * 1
            x2 = kelas2[1] - x1
            x3 = totalKubik - x1 - x2
            bill = x1 * tarif1 + x2 * tarif2 + x3 * tarif3 + beban_tetap
          } else if (totalKubik > kelas3[1]) {
            priceIn = 4
            x1 = kelas1[1] * 1
            x2 = kelas2[1] - x1
            x3 = kelas3[1] - x1 - x2
            x4 = totalKubik - x1 - x2 - x3
            bill = x1 * tarif1 + x2 * tarif2 + x3 * tarif3 + x4 * tarif4 + beban_tetap
          }
      
          console.log(totalKubik, x1, x2, x3, x4, priceIn)
      
          let data = {
            flow: flow + ' L',
            kubik: String(totalKubik).replace('.', ',') + ' m3',
            priceIn: 'limit ' + priceIn,
            beban_tetap: 'Rp' + beban_tetap.toLocaleString('id-ID'),
            bill: 'Rp' + parseInt(bill).toLocaleString('id-ID'),
            price: [tarif1, tarif2, tarif3, tarif4],
          }

          //input bills lora



        }
      }
      console.log("data < 36");
    }
  }
  res.send("ack");
};

module.exports = algoritma;
