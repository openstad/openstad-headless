const mysql = require('mysql2/promise');
const { getAzureAuthToken } = require('../src/util/azure')

async function connectToDatabase() {
  try {
    const dbPassword = await getAzureAuthToken();

    // Create a connection to the MySQL database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST, // Replace with your database host
      user: process.env.DB_USERNAME, // Replace with your database username
      password: dbPassword, // Use the password retrieved from Key Vault
      database: process.env.LEGACY_DB_NAME, // Replace with your database name
    });

    console.log("Connected to the MySQL database!");

    // Example query
    const [rows] = await connection.execute("SELECT * FROM ideas");
    console.log("Query results:", rows);

    // Close the connection
    await connection.end();
    console.log("Database connection closed.");
  } catch (err) {
    console.error("Error connecting to the database:", err.message);
  }
}

// Call the function to connect to the database
connectToDatabase();