import { db } from "../_lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { author,authorKana,isbn,itemCaption,largeImageUrl,publisherName,salesDate,seriesName,title,titleKana } = req.body;

  if (!isbn || !title) {
    return res.status(400).json({ error: "isbn & title required" });
  }

  try {
    await db.collection("books").doc(isbn).set({
      author,
      authorKana,
      isbn,
      itemCaption,
      largeImageUrl,
      publisherName,
      salesDate,
      seriesName,
      title,
      titleKana,
      createdAt: new Date()
    });

    res.status(200).json({ message: "saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
