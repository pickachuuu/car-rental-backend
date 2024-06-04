const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors')
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(express.json())
app.use(cors())

// MySQL connection pool configuration //
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'car_rental',
});


// Function to create user //
async function createUser(email, password, firstName, lastName, birthDate){
  pool.getConnection((error, connection) =>{
    if (error){
      console.error(error)
    }else{
      connection.query('INSERT INTO users (email, password, firstName, lastName, birthDate) VALUES (?, ?, ?, ?, ?)',
    [email, password, firstName, lastName, birthDate], (err) => {
      if (err){
        console.error(err)
      }else{
        console.log("Sucessfully added user")
      }
    })
    }
  })
}

async function getUser(email) {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error){ 
        console.error("failed to establish connection to database" + error)
        reject(error)
      }else{
        connection.query('SELECT password FROM users WHERE email = ?', [email], (err, result) => {
          if (err){
            console.error(err)
            reject(err)
          }else{
            resolve(result)
          }
          connection.release()
        })
      }
    })
  })
}

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const rows = await getUser(email); // Use await here
    if (!rows || rows.length === 0) {
      // No matching user found
      return res.status(404).send("User not found");
    }

    const hash = rows[0].password; // Assuming rows is an array with results
    console.log(password, hash);


    if (bcrypt.compareSync(password, hash)) {
      res.status(201).send("Login successful!"); // Send a success message
    } else {
      res.status(401).send("Invalid credentials"); // Send an error message
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal server error"); // Handle unexpected errors
  }
});


app.get("/api/user/:email", async (req, res) => {
  const email = req.params.email;
  const result = await getUser(email)
  console.log(result)
  res.send(result);
});


app.post("/api/register", async (req, res) => {
  const {email, password, firstName, lastName, birthDate} = req.body
  const hashPassword = await bcrypt.hash(password, 10)
  const user = await createUser(email, hashPassword, firstName, lastName, birthDate)
  console.log(user)
  res.send(user)
})


app.get('/api/getAllUsers', (req, res) => {
  const query = `SELECT firstName, lastName FROM users`;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    connection.query(query, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
      }
      console.log('Successfully retrieved user data!');
      res.json(results);
    });
    connection.release();
  });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));


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