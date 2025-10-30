import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
export async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    // Create a new customer
    try {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    // Get all customers
    try {
      const customers = await Customer.find({});
      res.status(200).json(customers);
  
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  else if (req.method === 'PUT') {
    try {
      const customers = await Customer.findByIdAndUpdate({})
      res.status(200).json(customers);
    } catch (error) {
      res.status(400).json({ error: error.message });

    }
  }
  else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }



}

export default handler;