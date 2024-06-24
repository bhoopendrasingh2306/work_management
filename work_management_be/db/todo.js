const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    text:String,
    userId:String,
    check:Boolean
});

module.exports = mongoose.model("todo",todoSchema);