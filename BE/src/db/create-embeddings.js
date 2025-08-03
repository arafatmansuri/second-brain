import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { getEmbedding } from "./get-embeddings.js";
dotenv.config();

export const createEmbeddings = async (data, id) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("brainly");
    const collection = db.collection("embeddings");

    var embedding = await getEmbedding(data);
    // console.log(embedding);
    // const bsonEmbedding = await convertEmbeddingsToBSON([embedding]);
    // console.log(bsonEmbedding);
    // embedding = bsonEmbedding;
    await collection.updateOne({ _id: id }, { $set: { embedding: embedding } });
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};
