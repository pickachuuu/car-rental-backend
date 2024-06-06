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



// async function createUser(email, password, firstName, lastName){
//   pool.query(`INSERT INTO users (email, password, firstName, lastName)
//   VALUES (?, ?, ?, ?)`,
//   [email, password, firstName, lastName]
//   )
// }


// app.post("/api/register", async (req, res) => {
//   const {email, password, firstName, lastName} = req.body
//   const hashPassword = await bcrypt.hash(password, 10)
//   const user = await createUser(email, hashPassword, firstName, lastName)
//   res.send(user)
// })


// async function getUser(email) {
//   return new Promise((resolve, reject) => {
//     pool.getConnection((error, connection) => {
//       if (error) {
//         console.error(error);
//         reject(error); // Reject the promise if there's an error getting the connection
//       } else {
//         connection.query(`SELECT * FROM users WHERE email =?`, email, (err, result) => {
//           if (err) {
//             console.error(err);
//             reject(err); // Reject the promise if there's an error executing the query
//           } else {
//             resolve(result); // Resolve the promise with the query result
//           }
//           connection.release(); // Always release the connection back to the pool
//         });
//       }
//     });
//   });
// }


// async function createUser(email, password, firstName, lastName, birthDate){
//   pool.query(`INSERT INTO users (email, password, firstName, lastName, birthDate)
//   VALUES (?, ?, ?, ?, ?)`,
//   [email, password, firstName, lastName, birthDate]
//   )
// }