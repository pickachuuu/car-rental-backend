const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors')
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')


dotenv.config()
process.env.TOKEN_SECRET


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


async function createUser(email, password, firstName, lastName, birthDate){
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connect) => {
      if (error){
        reject(error)
      }
      connect.query('INSERT INTO users (email, password, firstName, lastName, birthDate) VALUES (?, ?, ?, ?, ?)',
      [email, password, firstName, lastName, birthDate], (err, res) => {
        if (err){
          reject(new Error("1062"))
        }
        resolve(res)
      })
    })
  })
}


async function getUser(email) {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error){ 
        console.error("failed to establish connection to database" + error)
        reject(error)
      }else{
        connection.query('SELECT password, firstName, lastName, email, roleID FROM users WHERE email = ?', [email], (err, result) => {
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


function generateAccessToken(payload) {
  try{
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '30m' }); 
  }catch(error){
    console.error("failed to generate access token " + error)
  }
}


function authToken(req, res, next){
  const token = req.body.token
  if (token){
    const decode = jwt.verify(token, process.env.TOKEN_SECRET)
    return decode
  }else{
    res.json({
      login: false,
      data: "error",
    });
  }
}


app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const rows = await getUser(email);
    if (!rows || rows.length === 0) {
      return res.status(404).send("User not found");
    }
    const hash = rows[0].password;
    const role = rows[0].roleID;
    if (bcrypt.compareSync(password, hash)) {
      roleString = role === 1 ? "Admin" : "User"
      res.status(200).json({
        token: generateAccessToken({
          email: rows[0].email,
          username: rows[0].firstName,
          role: rows[0].roleID
        })
      }); 
    } else {
      res.status(401).json({
        login: false,
        error: "Invalid Credentials"
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      login: false,
      error: "Server Error"
    });
  }
});


app.get("/api/user/:email", async (req, res) => {
  const email = req.params.email;
  const result = await getUser(email)
  res.send(result);
});


app.post("/api/register", async (req, res) => {
  const {email, password, firstName, lastName, birthDate} = req.body
  const hashPassword = await bcrypt.hash(password, 10)
  try{
    await createUser(email, hashPassword, firstName, lastName, birthDate)
    res.status(201).send({
      message: "Sucessfully created user"
    })
  }catch(error){
    if (error.message === "1062") {
      res.status(409)
    }else{
      res.status(500)
    }
  }
})


app.get('/api/getAllUsers', authToken, (req, res) => {
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