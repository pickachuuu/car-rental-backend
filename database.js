// Check if database is connected //
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  } else {
    console.log('Database connection successful!');
    connection.release();
  }
}) 


app.get('/api/getAllUsers', (req, res) => {
  // Construct a secure query to avoid SQL injection vulnerabilities
  const query = `SELECT firstName, lastName FROM users`; // Selects all columns from the 'users' table
  pool.getConnection((err, connection) => {
    if (err) {
      // Handle connection error
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    connection.query(query, (error, results) => {
      if (error) {
        // Handle query error
        console.error(error);
        return res.status(500).send('Internal Server Error');
      }

      console.log('Successfully retrieved user data!');
      res.json(results); // Send the retrieved user data as JSON
    });
    connection.release(); // Release the connection back to the pool
  });
});