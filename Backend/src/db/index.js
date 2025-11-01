import mongoose from 'mongoose';

const connectDB = async () => {
   try {
      const dbURI = process.env.MONGODB_URI;

      const dbConnection = await mongoose.connect(dbURI);
      console.log('Database connected successfully');
      console.log('Connection state:', dbConnection.connection.readyState); // 1 = connected
      console.log('Database name:', dbConnection.connection.name);
      console.log('Host:', dbConnection.connection.host);
   } catch (error) {
      console.error('Error connecting to the database:', error.message);
      process.exit(1); // Exit the process with failure
   }
}

export default connectDB;