import { db } from "../_lib/firebaseAdmin";

export default async function handler(req, res) {
  try {
    const snapshot = await db.collection("books").orderBy("createdAt", "desc").get();

    const books = snapshot.docs.map(doc => doc.data());

    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
