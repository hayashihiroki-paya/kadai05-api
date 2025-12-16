import admin from "firebase-admin";

// 初期化（二重初期化防止）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      isbn,
      title,
      titleKana,
      author,
      authorKana,
      publisherName,
      seriesName,
      salesDate,
      itemCaption,
      largeImageUrl
    } = req.body;

    if (!isbn) {
      return res.status(400).json({ error: "isbn is required" });
    }

    await db.collection("books").doc(isbn).set({
      isbn,
      title,
      titleKana,
      author,
      authorKana,
      publisherName,
      seriesName,
      salesDate,
      itemCaption,
      largeImageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Firestore save failed" });
  }
}
