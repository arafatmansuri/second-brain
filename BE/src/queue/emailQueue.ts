import { Queue, Worker } from "bullmq";
import redis from "../config/redisClient";
import { sendMail } from "../utils/v2/googleMailerNodeMailer";

export const emailQueue = new Queue("email-queue", {
  connection: redis,
  defaultJobOptions: {
    // attempts: 3,
    backoff: { type: "exponential", delay: 5000},
    removeOnComplete: true,
    removeOnFail: false,
  },
});

new Worker(
  "email-queue",
  async (job) => {
    const { email, otp, username, subject } = job.data;
    // await sendMail(email, subject, username, otp);
    await sendMail({
      to: email,
      subject: subject,
      user: username,
      otp,
    });
    console.log(`OTP email sent to ${email}`);
  },
  {
    connection: redis,
    concurrency: 10,
  },
);

process.on("SIGINT", async () => {
  await emailQueue.close();
  process.exit();
});
