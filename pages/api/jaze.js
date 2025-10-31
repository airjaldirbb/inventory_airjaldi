export default async function handler(req, res) {
  const { userId } = req.query; // e.g. /api/jaze?userId=12345

  if (!userId) {
    return res.status(400).json({ error: "Missing userId in query" });
  }

  try {
    const url = `${process.env.JAZE_BASE_URL}/get_balance/${userId}`;
    console.log("🔗 Fetching Jaze URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.JAZE_USERNAME}:${process.env.JAZE_PASSWORD}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
       

    });

    const text = await response.text();
    console.log("🧾 Raw response:", text);

    if (!response.ok) {
      return res.status(response.status).json({ error: text });
    }

    const data = JSON.parse(text);
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error connecting to Jaze API:", error.message);
    res.status(500).json({ error: "Failed to connect to Jaze API" });
  }
}
