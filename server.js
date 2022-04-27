const express = require('express')
const path = require('path')
const { body, validationResult } = require('express-validator')
const mysql = require('mysql2');
const app = express()
const CookieSession = require('cookie-session');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));


const con = mysql.createPool({
  host: "node31258-rattana.app.ruk-com.cloud",
  user: "root",
  password: "MVCtwielIv",
  database: "shop"
});

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


app.use(CookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 3600 * 1000
}))


const isloggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render('showproduct')
  }
  next()
}



const notLogin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render('index')
  }
  next()
}


app.get('/', notLogin, (req, res, next) => {
  con.execute("SELECT * FROM mn_user WHERE Id = ?", [res.session.Userid])
    .then(([rows]) => {
      res.render('index', {
        name: rows[0].Fname,
        status: rows[0].Status
      })
    })
})


app.post('/registers', [
  body('email', 'Invalid Email Address!').trim().not().isEmpty(),
  body('fname', 'Firstname is Empty!').trim().not().isEmpty(),
  body('lname', 'Lastname is Empty!').trim().not().isEmpty(),
  body('phone', 'Username is Empty!').trim().not().isEmpty(),
  body('password', 'Password is Empty!').trim().not().isEmpty()
], (req, res, next) => {
  const validation_result = validationResult(req)
  const { fname, lname, email, phone, password } = req.body

  if (validation_result.isEmpty()) {
    con.execute("SELECT * FROM mn_user WHERE Email = ?", [email], (err, result) => {
      if (err) throw err
      if (result.length > 0) {
        res.send(`This Email is already <a href="register"> Try Again</a>`)
      }
      else {
        con.execute("INSERT INTO mn_user(Fname,Lname, Email, Phone, Password, Status) VALUES (?,?,?,?,?)", [fname, lname, email, phone, password])
        res.send(`<h3>Your account has been successfully <a href="index"> Login </a> </h3> <br>`)
      }
    })

  }

})


app.post('/logins', [
  body('email', 'Invalid Email Address!').trim().not().isEmpty(),
  body('password', 'Password is Empty!').trim().not().isEmpty()
], (req, res, next) => {
  const validation_result = validationResult(req)
  const { email, password } = req.body
  if (validation_result.isEmpty()) {
    con.execute("SELECT * FROM mn_user WHERE Email = ? AND Password=?", [email, password],(err,result)=>{
      
      if(err) res.render('index')
      if(result.length == 0) {
        
        return res.render('index')
      }
      else { 
       
        res.render('showproduct',{name:result[0].Fname,status:result[0].Status})
      }
    })
  
  }

})



app.get('/index', (req, res) => {
  res.render('index')
})



app.get('/register', (req, res, next) => {
  res.render('register')
})


app.get('/logout', (req, res, next) => {
  req.session = null
  res.redirect('/')
})

app.use('/', isloggedIn, (req, res, next) => {
  res.status(404).send(`Not is Page <a hrfe="showproduct"> GO BACK</a>`)
})


app.listen(11243, () => console.log('Start on port 11243'))
