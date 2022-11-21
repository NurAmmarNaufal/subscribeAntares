const pool = require("./config/db");

async function db(req, res) {
  const date = new Date();
  let mon = date.getMonth() + 1;
  let mon2 = mon - 1
  let year = date.getFullYear()

  if (mon === 1) {
    mon2 = mon
    mon = 12
    year = year - 1
  } 

  let devEui = '8cf95720000939bc'
  const identitas = await (await pool.query(`SELECT * FROM identitas_lora WHERE deveui = '${devEui}'`)).rows[0];
  
  let pg = await (await pool.query(
    `
      SELECT bulan, max(volume) as last FROM (
        SELECT * FROM data_lora WHERE bulan = ${mon} AND tahun = '${year}' AND deveui = '${devEui}'
        UNION
        SELECT * FROM data_lora WHERE bulan = ${mon2} AND tahun = '${year}' AND deveui = '${devEui}'
      ) as new
      GROUP BY bulan 
      ORDER BY last DESC
    `
  )).rows;

  let result = parseInt(pg[0].last) - parseInt(pg[1].last)
  let data = {
    dat: pg,
    iden: identitas,
    result: result
  } 

  res.status(200).json(data);
}

module.exports = db;
