const { Client } = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "1293",
    database: "CarRentalDB"
});

client.connect((err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
        return;
    }
    console.log("Connected to PostgreSQL!");

    client.query('SELECT * FROM owner', (err, res) => {
        if (!err) {
            console.log(res.rows);
        } else {
            console.error("Error executing query:", err.message);
        }

        // Properly close the connection
        client.end((err) => {
            if (err) {
                console.error("Error closing the connection:", err.message);
            } else {
                console.log("Connection closed.");
            }
        });
    });
});
