const mongoose = require('mongoose');

const loginScheema = new mongoose.Schema({
    name:{
        type: String,
        require
    },
    email:{
        type: String,
        require
    },
    password: {
        type: String,
        require
    }
});

module.exports = mongoose.model('registerTable', loginScheema);