import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI as string);

async function run() {
  try {
    const database = client.db("brainly");
    const collection = database.collection("embeddings");

    // ✅ Correct Vector Index Definition
    const index = {
      name: "vector_index",
      definition: {
        mappings: {
          dynamic: true,
          fields: {
            embedding: {
              type: "knnVector",
              dimensions: 768,
              similarity: "dotProduct", // or "cosine"
            },
          },
        },
      },
    };

    // 🛠️ Create the search index
    const result = await collection.createSearchIndex(index);
    console.log("Index created:", result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
