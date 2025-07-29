import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();
// connect to your Atlas deployment
const client = new MongoClient(process.env.MONGODB_URI);

async function run() {
  try {
    const database = client.db("brainly");
    const collection = database.collection("contents");

    // Define your Atlas Vector Search index
    const index = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            similarity: "dotProduct",
            numDimensions: 768,
          },
        ],
      },
    };

    // Call the method to create the index
    const result = await collection.createSearchIndex(index);
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
