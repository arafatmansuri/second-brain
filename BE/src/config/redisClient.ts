import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();
const redisClient = new Redis(process.env.REDIS_URL as string,{maxRetriesPerRequest:null});
// const redisClient = new Redis({
//     host:"127.0.0.1",
//     port:6379
// });

export default redisClient;
