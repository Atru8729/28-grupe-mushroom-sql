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
    let i = 0;

    const upName = str => {
        return str[0].toUpperCase() + str.slice(1);
    }

    // LOGIC BELOW

    // 1
    sql = 'SELECT `mushroom`, `price` FROM `mushroom` ORDER BY `price` DESC';
    [rows] = await connection.execute(sql);

    console.log('Grybai:');
    for (const { mushroom, price } of rows) {
        console.log(`${++i}) ${upName(mushroom)} - ${price} EUR/kg`);
    }

    console.log('');
    // 2
    sql = 'SELECT `name` FROM `gatherer`';
    [rows] = await connection.execute(sql);

    const names = rows.map(obj => obj.name);
    console.log(`Grybautojai: ${names.join(', ')}.`);

    console.log('');
    // 3
    sql = 'SELECT `mushroom` \
            FROM `mushroom` \
            WHERE `price` = ( \
                SELECT MAX(`price`) FROM `mushroom` \
            )';
    [rows] = await connection.execute(sql);

    console.log(`Brangiausias grybas yra: ${upName(rows[0].mushroom)}.`);

    console.log('');
    // 4
    sql = 'SELECT `mushroom` \
            FROM `mushroom` \
            WHERE `price` = ( \
                SELECT MIN(`price`) FROM `mushroom` \
            )';
    [rows] = await connection.execute(sql);

    console.log(`Pigiausias grybas yra: ${upName(rows[0].mushroom)}.`);

    console.log('');
    // 5
    sql = 'SELECT `mushroom`, (1000 / `weight`) as amount \
            FROM `mushroom` ORDER BY `mushroom` ASC';
    [rows] = await connection.execute(sql);

    console.log('Grybai:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upName(item.mushroom)} - ${(+item.amount).toFixed(1)}`);
    }

    console.log('');
    // 6
    sql = 'SELECT `name`, SUM(`count`) as amount \
            FROM `basket` \
            LEFT JOIN `gatherer` \
                ON `gatherer`.`id` = `basket`.`gatherer_id` \
            GROUP BY `basket`.`gatherer_id` \
            ORDER BY `name`';
    [rows] = await connection.execute(sql);

    console.log('Grybu kiekis pas grybautoja:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upName(item.name)} - ${item.amount} grybu`);
    }

    console.log('');
    // ** 7. ** _Isspausdinti, visu grybautoju krepseliu kainas(issirikiuojant nuo 
    //brangiausio link pigiausio krepselio), suapvalinant iki centu_


}

app.init();

module.exports = app;