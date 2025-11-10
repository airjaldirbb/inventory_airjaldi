// models/SalesInvoice.js
items: [
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "ItemMaster" }, // 🔗 reference to ItemMaster
    quantity: Number,
    rate: Number,
    total: Number,
  },
]