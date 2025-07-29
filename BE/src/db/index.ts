import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      <string>`${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
  } catch (err) {
    console.log("Error connecting database", err);
    process.exit(1);
  }
};

export { connectDB };
