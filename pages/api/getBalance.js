export default async function handler(req, res) {
  const userId = "583840662023040"; // hardcoding your userId for testing
  const apiKey = process.env.JAZE_API_KEY; // ensure this is in .env.local

  if (!apiKey) {
    return res.status(500).json({ error: "API key not set" });
  }

  try {

    const response = await fetch(`http://localhost:8001/api/v1/get_balance/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const text = await response.text(); // get raw response first

    let data;
    try {
      data = JSON.parse(text); // parse JSON
    } catch (err) {
      data = text;
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error fetching balance:", error.message);
    res.status(500).json({ error: error.message });
  }
}
