import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { getEmbedding } from "./get-embeddings.js";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function run() {
  try {
    // Connect to the MongoDB client
    await client.connect();

    // Specify the database and collection
    const database = client.db("brainly");
    const collection = database.collection("embeddings");

    // Generate embedding for the search query
    const queryEmbedding = await getEmbedding("Vectore DB");
    // Define the sample vector search pipeline
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          exact: true,
          limit: 5,
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ];

    // run pipeline
    const result = collection.aggregate(pipeline);
    // print results
    for await (const doc of result) {
      console.dir(JSON.stringify(doc));
    }
  } finally {
    await client.close();
  }
}
// run().catch(console.dir);
export const searchFromEmbeddings = async (query, userId) => {
  try {
    // Connect to the MongoDB client
    await client.connect();

    // Specify the database and collection
    const database = client.db("brainly");
    const collection = database.collection("embeddings");

    // Generate embedding for the search query
    const queryEmbedding = await getEmbedding(query);
    // Define the sample vector search pipeline
    // console.log(JSON.stringify(queryEmbedding));
    // run pipeline
    const result = collection.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          exact: true,
          limit: 5,
        },
      },
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          page: 1,
          data: 1,
          score: {
            $meta: "vectorSearchScore",
          },
          start: 1,
          end: 1,
          videoTitle: 1,
          description: 1,
          staticstics: {
            viewCount: 1,
            likeCount: 1,
            favoriteCount: 1,
            commentCount: 1,
          },
          duration: 1,
          channelName: 1,
          full_text: 1,
          extendedTweet: 1,
          userDescription: 1,
          username: 1,
          totalLikes: 1,
          totalViews: 1,
          totalFollowers: 1,
          totalFollowings: 1,
          title: 1,
          main_content: 1,
          summary: 1,
          keywords: 1,
        },
      },
    ]);
    const resultArray = [];
    for await (const doc of result) {
      resultArray.push(doc);
      // console.log(doc);
    }
    return resultArray;
  } finally {
    await client.close();
  }
};
