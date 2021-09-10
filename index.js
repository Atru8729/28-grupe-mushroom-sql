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
    sql = 'SELECT `gatherer`.`name`, SUM(`basket`.`count`) as amount \
            FROM `basket` \
            LEFT JOIN `gatherer` \
                ON `gatherer`.`id` = `basket`.`gatherer_id` \
            GROUP BY `basket`.`gatherer_id` \
            ORDER BY `gatherer`.`name` ASC';
    [rows] = await connection.execute(sql);

    console.log('Grybu kiekis pas grybautoja:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upName(item.name)} - ${item.amount} grybu`);
    }

    console.log('');
    // 7
    sql = 'SELECT `gatherer`.`name`, \
                SUM(`basket`.`count` * `mushroom`.`weight` * `mushroom`.`price` / 1000) as totalPrice \
            FROM `gatherer` \
            LEFT JOIN `basket` \
                ON `gatherer`.`id` = `basket`.`gatherer_id` \
            LEFT JOIN `mushroom` \
                ON `mushroom`.`id` = `basket`.`mushroom_id` \
            GROUP BY `gatherer`.`id` \
            ORDER BY totalPrice DESC';
    [rows] = await connection.execute(sql);

    console.log('Grybu krepselio kainos pas grybautoja:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upName(item.name)} - ${(+item.totalPrice).toFixed(2)} EUR`);
    }

    console.log('');
    // 8
    async function mushroomsByRating(lang) {
        const languages = ['en', 'lt'];
        lang = languages.includes(lang) ? lang : languages[0];

        const texts = {
            title: {
                en: 'Mushrooms count by rating',
                lt: 'Grybu kiekis pagal ivertinima',
            },
            stars: {
                en: 'stars',
                lt: 'zvaigzdutes',
            },
            mushrooms: {
                en: 'mushrooms',
                lt: 'grybai',
            },
        }

        const sql = 'SELECT `ratings`.`id`, \
                            `ratings`.`name_' + lang + '` as translation, \
                            SUM(`basket`.`count`) as amount \
                    FROM `ratings` \
                    LEFT JOIN `mushroom` \
                        ON `ratings`.`id` = `mushroom`.`rating`\
                    LEFT JOIN `basket` \
                        ON `mushroom`.`id` = `basket`.`mushroom_id`\
                    GROUP BY `ratings`.`id` \
                    ORDER BY `ratings`.`id` DESC';
        const [rows] = await connection.execute(sql);

        console.log(`${texts.title[lang]}:`);
        for (const item of rows) {
            const stars = texts.stars[lang];
            const tr = item.translation;
            const amount = item.amount ? item.amount : 0;
            const mushroom = texts.mushrooms[lang];
            console.log(`${item.id} ${stars} (${tr}) - ${amount} ${mushroom}`);
        }
    }

    await mushroomsByRating('en');
    console.log('');
    await mushroomsByRating('lt');

    console.log('');
    // 9
    sql = 'SELECT `mushroom` FROM `mushroom` WHERE `rating` >= 4 ORDER BY `rating` ASC';
    [rows] = await connection.execute(sql);

    const mushroom = rows.map(obj => upName(obj.mushroom));
    console.log(`Grybai: ${mushroom.join(', ')}.`);

    console.log('');
    // 10
    sql = 'SELECT `mushroom` \
            FROM `mushroom` \
            WHERE `rating` IN (1, 3, 5) \
            ORDER BY `rating` ASC';
    [rows] = await connection.execute(sql);

    const mushroom135 = rows.map(obj => upName(obj.mushroom));
    console.log(`Grybai: ${mushroom135.join(', ')}.`);
}

app.init();

module.exports = app;