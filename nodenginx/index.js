const express = require('express');
const mysql = require('mysql');
const util = require('util');

const app = express();
const port = 3000;

const config = {
    host: 'db',  // Nome do serviço Docker do banco de dados
    user: 'root',
    password: 'root',
    database: 'nodenginx',
    port: '4000'  // Porta onde o MySQL estará acessível no contêiner
};

const connection = mysql.createConnection(config);

// Promisify the query function
const query = util.promisify(connection.query).bind(connection);

async function initializeDatabase() {
    try {
        await query('CREATE TABLE IF NOT EXISTS people (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL)');
        await query("INSERT IGNORE INTO people(name) VALUES('Luiz')");
        console.log('Inserted default data');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
    console.log('Table created or already exists');
}

app.get("/", async (req, res) => {
    try {
        const results = await query('SELECT * FROM people');
        const namesList = results.map(person => `<li>${person.name}</li>`).join('');
        res.send(`
            <h1>Full Cycle Rocks!</h1>
            <ul>${namesList}</ul>
        `);
    } catch (err) {
        console.error('Error executing SELECT query:', err);
        res.status(500).send('Error retrieving data from the database');
    }
});

app.listen(port, async () => {
    await initializeDatabase();
    console.log(`Rodando na porta ${port}`);
});