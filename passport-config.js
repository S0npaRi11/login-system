const localStrategy = require('passport-local').Strategy;

 const mongoose = require('mongoose');

 const regTable = require('./dbConnect');


const bcrypt = require('bcrypt');

function initialize(passport,getUserByEmail, getUserById){
    const authenticateUser = (email,password,done) => {
        regTable.findOne({email: email}) 
            .then(user => {
                if(!user){
                    return done(null,false,{message: 'No user with that email'});
                }

                bcrypt.compare(password,user.password, (err,isMatch) => {
                    if(err) throw err

                    if(isMatch){
                        return done(null, user);
                    }else{
                        return done(null,false,{message: 'Incorrect Password'});
                    }
                })
            })
    }
    passport.use(new localStrategy({usernameField: 'email'}, authenticateUser));

    passport.serializeUser((user, done) => done(null,user.id));

    passport.deserializeUser((id, done) => done(null, getUserById(id)));
}

module.exports = initialize