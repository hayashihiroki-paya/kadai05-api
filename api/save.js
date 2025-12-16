import admin from "firebase-admin";

// 初期化（二重初期化防止）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // ===== CORS ヘッダー =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ===== preflight 対応 =====
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ===== POST 以外は拒否 =====
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }


  try {
    const data = req.body;

    // 仮ログ（確認用）
    console.log("received:", data);

    if (!data?.isbn) {
      return res.status(400).json({ error: "isbn is required" });
    }

    await db.collection("books").doc(data.isbn).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Firestore save failed" });
  }
}
