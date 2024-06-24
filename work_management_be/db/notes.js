const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
    
    text:String,
    filename:String,
    userId:String
});

module.exports = mongoose.model("notes",notesSchema);