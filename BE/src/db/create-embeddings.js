import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { convertEmbeddingsToBSON } from "./convert-embeddings.js";
import { getEmbedding } from "./get-embeddings.js";
dotenv.config();

async function run() {
  // Connect to your Atlas cluster
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("brainly");
    const collection = db.collection("contents");

    // Filter to exclude null or empty summary fields
    const filter = { description: { $nin: [null, ""] } };

    // Get a subset of documents from the collection
    const documents = await collection.find(filter).limit(50).toArray();

    console.log("Generating embeddings and updating documents...");
    const updateDocuments = [];
    documents.forEach((d) => console.log("document: ", d));
    console.log(documents);
    await Promise.all(
      documents.map(async (doc) => {
        // Generate an embedding using the function that you defined
        var embedding = await getEmbedding(doc.description);

        // Uncomment the following lines to convert the generated embedding into BSON format
        const bsonEmbedding = await convertEmbeddingsToBSON([embedding]); // Since convertEmbeddingsToBSON is designed to handle arrays
        embedding = bsonEmbedding; // Use BSON embedding instead of the original float32 embedding

        // Add the embedding to an array of update operations
        updateDocuments.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { embedding: embedding } },
          },
        });
      })
    );
    if (updateDocuments.length === 0) {
      console.log(
        "No documents found or no embeddings generated. Skipping bulkWrite."
      );
      return;
    }
    // Continue processing documents if an error occurs during an operation
    const options = { ordered: false };

    // Update documents with the new embedding field
    
    const result = await collection.bulkWrite(updateDocuments, options);
    console.log("Count of documents updated: " + result.modifiedCount);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
