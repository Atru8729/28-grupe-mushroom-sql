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
    ///** 7. ** _Isspausdinti, visu grybautoju krepseliu kainas(issirikiuojant 
    //nuo brangiausio link pigiausio krepselio), suapvalinant iki centu
    sql = 'SELECT `name`, SUM(`count` * `price` * `weight`/ 1000) as amount\
                FROM`basket`\
                LEFT JOIN `gatherer`\
                ON `gatherer`.`id` = `basket`.`gatherer_id`\
                LEFT JOIN `mushroom`\
                ON `mushroom`.`id` = `basket`.`mushroom_id`\
                GROUP BY `basket`.`gatherer_id`\
                ORDER BY `amount` DESC';
    [rows] = await connection.execute(sql);
    //console.log(rows);
    console.log(`Grybu krepselio kainos pas grybautoja:`);
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upName(item.name)} - ${+item.amount} EUR`); //${+(+item.amount).toFixed(1)} prieki pliusas nuima skaicius po kablelio
    }

    console.log('');
    //**8** _Isspausdinti, kiek nuo geriausiai vertinamu iki blogiausiai 
    //vertinamu grybu yra surinkta. Spausdinima turi atlikti funkcija 
    //(pavadinimu `mushroomsByRating()`), kuri gauna vieninteli 
    //parametra - kalbos pavadinima, pagal kuria reikia sugeneruoti rezultata

    async function mushroomsByRating(lang = 'en') {
        sql = 'SELECT `ratings`.`id`, `name_' + lang + '`, SUM(`count`) as amount\
    FROM `ratings`\
    LEFT JOIN `mushroom`\
    ON `mushroom`.`rating` = `ratings`.`id`\
    LEFT JOIN `basket`\
    ON `basket`.`mushroom_id` = `mushroom`.`id`\
    GROUP BY `ratings`.`id`\
    ORDER BY `ratings`.`id` DESC';
        [rows] = await connection.execute(sql);
        console.log(rows);
    }
    const kalbaLt = mushroomsByRating('lt');
    const kalbaEn = mushroomsByRating('en');

    console.log('');
    // ** 9 ** _Isspausdinti, visus grybus, kuriu ivertinimas geresnis 
    //arba lygus 4 zvaigzdutem, isrikiuotus gereji tvarka_
    // pvz.: Grybai: Grybas, Grybas, Grybas.
    sql = 'SELECT `rating`, `mushroom` FROM `mushroom`\
    ORDER BY `rating` ASC';
    [rows] = await connection.execute(sql);
    let grybai = [];
    for (let i = 0; i < rows.length; i++) {
        ratingMushroom = rows[i].rating;
        if (ratingMushroom >= 4) {
            grybai.push(upName(rows[i].mushroom));
        }
    }
    console.log(`Grybai: ${grybai.join(', ')}.`);
}


app.init();

module.exports = app;