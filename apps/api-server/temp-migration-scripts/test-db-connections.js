const mysql = require('mysql2/promise');

const getDbPassword = async () => {
	switch(process.env.DB_AUTH_METHOD) {
		case 'azure-auth-token':
			const { getAzureAuthToken } = require('../src/util/azure')
			return await getAzureAuthToken()
		default:
			return process.env.DB_PASSWORD
	}
}

async function connectToDatabase() {
  try {
    const dbPassword = await getDbPassword();

    const ssl = {
        rejectUnauthorized: false
    }

    if (process.env.DB_REQUIRE_SSL) {
        ssl.rejectUnauthorized = true;
        ssl.require = true;
    }

    // Create a connection to the MySQL database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: dbPassword,
      database: "apilegacy",
      ssl,
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