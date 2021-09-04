const mysql = require('mysql2/promise');

const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'mushroom',
    });

    let sql = '';
    let rows = [];

    // ** 1. ** _Isspausdinti, visu grybu pavadinimus ir ju kainas, grybus isrikiuojant nuo brangiausio link pigiausio_
    //     pvz.:
    //     ```
    // Grybai:
    // 1) Pavadinimas - 10.00 EUR/kg
    // 2) Pavadinimas - 8.00 EUR/kg
    // 3) Pavadinimas - 5.00 EUR/kg
    // ```
    sql = 'SELECT `mushroom`, `price` FROM `mushroom` ORDER BY `mushroom`.`weight` DESC';
    [rows] = await connection.execute(sql);
    let mushroomName = '';
    let mushroomPrice = 0;
    console.log(`Grybai:`);
    for (let i = 0; i < rows.length; i++) {
        mushroomName = rows[i].mushroom;
        mushroomPrice = +rows[i].price;
        newMushroomName = mushroomName.charAt(0).toUpperCase(0) + mushroomName.slice(1);

        console.log(`${i + 1}) ${newMushroomName} - ${mushroomPrice.toFixed(2)} EUR/kg`);
    }


    // LOGIC BELOW


}

app.init();

module.exports = app;