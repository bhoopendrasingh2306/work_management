const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/work_management_db');
mongoose.connect(`mongodb+srv://bhoopendrasingh2306:bhoopendra@workmanagement.6gzxm1u.mongodb.net/?retryWrites=true&w=majority&appName=workmanagement`);
mongoose.connection.once('open', () => {
    console.log('mongodb connected successfully',);
});