export default async function handler(req, res) {
  const { type, value } = req.query;

  if (!type || !value) {
    return res.status(400).json({ error: "Both type and value are required" });
  }

  try {
    // Use 'value' as the phone number dynamically
    const phone = value;

    const response = await fetch(
      `https://portal.airjaldi.net/api/v1/get_user_from_all_accounts/phone/${phone}`,
      {
        headers: {
          Authorization: `Basic ${process.env.AIRJALDI_AUTH}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data", details: error.message });
  }
}