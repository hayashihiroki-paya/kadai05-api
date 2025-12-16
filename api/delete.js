import admin from "firebase-admin";

// 初期化（二重防止）
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(
            JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        )
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    // ===== CORS ヘッダー =====
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // ===== preflight 対応 =====
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // ===== DELETE 以外拒否 =====
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { isbn } = req.query;

        if (!isbn) {
            return res.status(400).json({ error: "isbn is required" });
        }

        await db.collection("books").doc(isbn).delete();

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("delete error:", err);
        res.status(500).json({ error: "Delete failed" });
    }
}