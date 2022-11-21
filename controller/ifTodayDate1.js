let update = true;
const pool = require("../config/db");

async function seconds() {
  const date = new Date();
  const day = date.getMinutes();
  if (day % 10 === 0) {
    if (update === true) {
      update = false;
      console.log(`upload data...${day}`);
      const data = await (await pool.query("SELECT * FROM data_lora")).rows
      //push data into bills lora
      //
    }
  } else {
    update = true;
  }
}

setInterval(seconds, 1000);

module.exports = seconds;
