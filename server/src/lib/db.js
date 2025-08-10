import mongoose from "mongoose";

export const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB ${connection.connection.host}!`);
  } catch (error) {
    console.log("Failed to Connect to MongoDB!", error);
    process.exit(1);
  }
};
