import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
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
    let relevantResult = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            queryVector: queryEmbedding,
            path: "embedding",
            exact: true,
            limit: 5,
            filter: { userId: new ObjectId(userId) },
          },
        },
        {
          $project: {
            _id: 0,
            score: {
              $meta: "vectorSearchScore",
            },
            page: 1,
            data: 1,
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
            contentId: 1,
          },
        },
        {
          $match: {
            score: { $gte: 0.65 },
          },
        },
        {
          $limit: 3,
        },
      ])
      .toArray();
    // resultArray.sort((a, b) => b.score - a.score);
    // console.log("After Sorting",JSON.stringify(resultArray));
    // let relevantResult = resultArray.filter((r) => r.score >= 0.8);
    if (relevantResult.length === 0) {
      try {
        relevantResult = await collection
          .aggregate([
            {
              $search: {
                index: "multiFieldSearch",
                text: {
                  query: query,
                  path: [
                    "title",
                    "data",
                    "videoTitle",
                    "description",
                    "channelName",
                    "full_text",
                    "userDescription",
                    "extendedTweet",
                    "username",
                    "main_content",
                    "summary",
                  ],
                  fuzzy: {
                    maxEdits: 2,
                  },
                },
              },
            },
            {
              $project: {
                embedding: 0,
                score: { $meta: "searchScore" },
              },
            },
            {
              $match: {
                userId: new ObjectId(userId),
                score: { $gte: 0.8 },
              },
            },
            {
              $limit: 3,
            },
          ])
          .toArray();
      } catch (err) {
        console.log(err);
      }
    }
    if (relevantResult.length > 0) {
      return relevantResult;
    } else {
      return [];
    }
  } finally {
    await client.close();
  }
};
