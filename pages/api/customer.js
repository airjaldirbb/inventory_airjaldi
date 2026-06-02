import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;
  const { id } = req.query;

  if (method === "POST") {
    // Create new customer
    try {
      const { custName, phone, code, email, city, location, company, gst, user, ledger, serialTrackingEnabled } = req.body;

      // Validate required fields
      if (!custName || !phone) {
        return res.status(400).json({ error: "Customer name and phone are required" });
      }

      const customer = new Customer({
        custName,
        phone,
        code: code || "",
        email: email || "",
        city: city || "",
        location: location || "",
        company: company || "",
        gst: gst || "",
        user: user || "Tester",
        ledger: ledger || "General Ledger",
        serialTrackingEnabled: !!serialTrackingEnabled,
      });

      await customer.save();
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  else if (method === "GET") {
    // Get all customers or a single one by ID
    try {
      if (id) {
        const customer = await Customer.findById(id);
        if (!customer) {
          return res.status(404).json({ error: "Customer not found" });
        }
        res.status(200).json(customer);
      } else {
        const customers = await Customer.find({}).sort({ createdAt: -1 });
        res.status(200).json(customers);
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  else if (method === "PUT") {
    // Update customer
    try {
      if (!id) return res.status(400).json({ error: "Customer ID is required" });

      const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedCustomer) return res.status(404).json({ error: "Customer not found" });

      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  else if (method === "DELETE") {
    // Delete customer
    try {
      if (!id) return res.status(400).json({ error: "Customer ID is required" });

      const deletedCustomer = await Customer.findByIdAndDelete(id);
      if (!deletedCustomer) return res.status(404).json({ error: "Customer not found" });

      res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
