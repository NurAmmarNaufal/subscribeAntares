const pool = require("./config/db");

async function db(req, res) {
  let devEuiParam = req.params;
  let respon = "salah"
  let devEui = ""

  const db = await (await pool.query("SELECT * FROM identitas_lora")).rows[0]
  const pg = await (await pool.query("SELECT * FROM  progresif where kota='surakarta' order by id asc")).rows

  res.status(200).json(pg)
}

module.exports = db;
