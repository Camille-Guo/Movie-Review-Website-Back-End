const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology:true,
            useNewUrlParser:true,
            useCreateIndex:true,
        });

        console.log(`MongoDB connected successfully ${conn.connection.host} ${conn.connection.port}`);
    }catch(err) {
        console.error(`err: ${err.message}`);
        process.exit();
    }
};

module.exports = connectDB;