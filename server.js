if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require("express");
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const app = express();
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const regTable = require('./dbConnect');

const initializePassport = require('./passport-config');

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection

db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to mongoose'));



initializePassport(
    passport,
    email =>regTable.find({email: email}, (error, user) => {
        if(error){
            console.error(error);
        }else{
           return user;
        }
    }),
    id => regTable.find({id: id}, (error, user) => {
        if(error){
            console.error(error);
        }else{
           return user
        }
    })
);


app.set('viwe-engine','ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/',checkAuthenticated,(req,res) => {
    res.render('index.ejs', {name : req.user.name});
});

app.get('/login',checkNotAuthenticated ,(req,res) => {
    res.render('login.ejs');
});

app.post('/login',checkNotAuthenticated,passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
}));

app.get('/register',checkNotAuthenticated ,(req,res) => {
    res.render('register.ejs');
});

app.post('/register',checkNotAuthenticated, async (req,res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const register = new regTable({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        register.save( (err, newRegister) => {
            if(err){
                res.render('/register',{
                    errorMessage: 'error while entering',
                });

            }else{
                res.redirect('/login');
            }
        });
       
    }
    catch{
        res.redirect('/register');
    }
   // console.log(users);
});

app.delete('/logout',(req,res) => {
    req.logOut();
    res.redirect('/login');
});

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
      return res.redirect('/');
    }
   next();
}


app.listen(3000);