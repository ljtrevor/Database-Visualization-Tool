var mongoose = require('mongoose');

// User Schema
var projectSchema = mongoose.Schema({
    title: {type: String, required : true},
    address: {type: String, required: true},
    dbname: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    bellatrix_username: {type:String, required: true}
});

module.exports = mongoose.model('Project', projectSchema);
