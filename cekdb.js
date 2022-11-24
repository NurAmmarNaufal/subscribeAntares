const pool = require("./config/db");

async function db(req, res) {
  let date = new Date();
  let mon = date.getMonth();
  let mon2 = mon - 1;
  let year = date.getFullYear();

  let devEuiLora = "8cf9572000092ac1";

  const cekDataBulanS = (
    await pool.query(
      `SELECT bulan FROM data_lora WHERE bulan = ${mon} AND deveui = '${devEuiLora}' LIMIT 1`
    )
  ).rows;

  console.log(cekDataBulanS)

  const cekDataBulanSS = (
    await pool.query(
      `SELECT bulan FROM data_lora WHERE bulan = ${mon2} AND deveui = '${devEuiLora}'`
    )
  ).rows[0];

  let query = "";
  let a = "";
  if (cekDataBulanSS) {
    a = 'data 1'
    query = `
            SELECT bulan, max(volume) as last FROM (
              SELECT * FROM data_lora WHERE bulan = ${mon} AND tahun = '${year}' AND deveui = '${devEuiLora}'
              UNION
              SELECT * FROM data_lora WHERE bulan = ${mon2} AND tahun = '${year}' AND deveui = '${devEuiLora}'
            ) as new
            GROUP BY bulan 
            ORDER BY last DESC
          `
  }else{
    a = 'data2'
    query = `
            SELECT bulan, max(volume) as last FROM (
              SELECT * FROM data_lora WHERE bulan = ${mon} AND tahun = '${year}' AND deveui = '${devEuiLora}'
            ) as new
            GROUP BY bulan 
            ORDER BY last DESC
          `
  }
  const cekDataBulan = (await pool.query(query)).rows;


  let data = {
    data1: cekDataBulan,
    a: a
  };

  if (cekDataBulanS.length !== 0) {
    console.log('aha')
  }else{
    console.log('ih')
  }

  res.status(200).json(cekDataBulanS.length);
}

module.exports = db;
