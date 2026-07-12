import mongoose from "mongoose";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);
const connectDB = async () => {
  try {
    await mongoose.connect(
      <string>`${process.env.MONGODB_URI}/${process.env.DB_NAME}`,
    );
  } catch (err) {
    console.log("Error connecting database", err);
    process.exit(1);
  }
};

export { connectDB };
