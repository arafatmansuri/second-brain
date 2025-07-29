import axios from "axios";
export const getTweetDescription = async (id: string): Promise<string> => {
  try {
    const response = await axios.get(
      `https://api.x.com/2/tweets/${id}?tweet.fields=id,text`,
      {
        headers: {
          Authorization: process.env.X_BEARER_TOKEN,
        },
      }
    );
    return response.data.data.text;
  } catch (err) {
    return "";
  }
};
