import { createWorker } from "tesseract.js";

const getDocumentText = async (link: string) => {
  const worker = await createWorker("eng", 1, {
    logger: (m) => console.log(m),
  });
  const ret = await worker.recognize(link);
  console.log(ret.data.text);
  await worker.terminate();
  return ret.data.text;
};

getDocumentText(
  "https://imgv3.fotor.com/images/blog-cover-image/How-to-Make-Text-Stand-Out-And-More-Readable.jpg"
)
  .then((data) => console.log(data))
  .catch((err) => console.log(err));
