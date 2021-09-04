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

    sql = 'SELECT * FROM `trips`';
    [rows] = await connection.execute(sql);

    // LOGIC BELOW
    // ** 1. ** _Isspausdinti, visu grybu pavadinimus ir ju kainas, grybus isrikiuojant nuo brangiausio link pigiausio_

    //     pvz.:
    //     ```
    // Grybai:
    // 1) Pavadinimas - 10.00 EUR/kg
    // 2) Pavadinimas - 8.00 EUR/kg
    // 3) Pavadinimas - 5.00 EUR/kg
    // ```


}

app.init();

module.exports = app;