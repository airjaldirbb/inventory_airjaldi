import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

export default function PurchaseBill() {
  const [branches, setBranches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorEmail, setVendorEmail] = useState("");
  const [itemList, setItemList] = useState([]);
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  // ================= BILL STATE =================
  const [billData, setBillData] = useState({
    gstType: "TaxInvoice",
    cashOrCredit: "Credit",
    branch: null,
    vendor: null,
    email: "",
    date: new Date().toISOString().substring(0, 10),
    invoiceNo: "",
    supplierInvNo: "",
    supplierInvDate: new Date().toISOString().substring(0, 10),
    taxMode: "Exclusive",
    paymentTerms: "On Credit",
    dueDate: new Date().toISOString().substring(0, 10),
    remarks: "",
    freightAmount: 0,
  });

  // ================= ITEM FORM =================
  const [itemForm, setItemForm] = useState({
    itemId: "",
    item: "",
    unit: "",
    quantity: 0,
    rate: 0,
    taxPercent: 0,
    taxAmount: 0,
    freightAmount: 0,
    totalAmount: 0,
    remarks: "",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    loadBranches();
    loadVendors();
    fetchItems();
  }, []);

  const loadBranches = async () => {
    const res = await axios.get("/api/branch");
    setBranches(res.data);
  };

  const loadVendors = async () => {
    const res = await axios.get("/api/vendorApi");
    setVendors(res.data);
  };

  const fetchItems = async () => {
    const res = await axios.get("/api/item");
    setItemList(res.data.data || []);
  };

  // ================= ADD ITEM =================
const addItem = () => {
  const quantity = Number(itemForm.quantity);
  const rate = Number(itemForm.rate);
  const taxPercent = Number(itemForm.taxPercent || 0);

  const amount = quantity * rate;
  const taxAmount = (amount * taxPercent) / 100;
  const freightAmount = Number(itemForm.freightAmount || 0);
  const totalAmount = amount + taxAmount + freightAmount;

  setItems((prev) => [
    ...prev,
    {
      id: prev.length + 1,
      item: itemForm.item,          // STRING ✔
      unit: itemForm.unit,          // STRING ✔
      quantity,                     // NUMBER ✔
      rate,                          // NUMBER ✔
      amount,                        // REQUIRED ✔
      taxPercent,                    // REQUIRED ✔
      taxAmount,
      freightAmount,
      totalAmount,
      remarks: itemForm.remarks,
    },
  ]);

  setOpenDialog(false);
  setItemForm({
    itemId: "",
    item: "",
    unit: "",
    quantity: 0,
    rate: 0,
    taxPercent: 0,
    taxAmount: 0,
    freightAmount: 0,
    totalAmount: 0,
    remarks: "",
  });
};

  // ================= SAVE BILL =================
const handleSubmit = async () => {
  if (!billData.branch) return alert("Select Branch");
  if (!billData.vendor) return alert("Select Vendor");
  if (!billData.supplierInvNo) return alert("Supplier Invoice No required");
  if (items.length === 0) return alert("Add at least one item");

  // Bill totals
  const amount = items.reduce((a, i) => a + i.amount, 0);
  const taxAmount = items.reduce((a, i) => a + i.taxAmount, 0);
  const freightAmount = items.reduce((a, i) => a + i.freightAmount, 0);
  const totalAmount = amount + taxAmount + freightAmount;

  const taxPercent =
    items.reduce((a, i) => a + i.taxPercent, 0) / items.length;

  const payload = {
    gstType: billData.gstType,
    cashOrCredit: billData.cashOrCredit,
    branch: billData.branch,           // ObjectId ✔
    vendor: billData.vendor,           // ObjectId ✔
    email: billData.email,
    date: billData.date,
    invoiceNo: billData.invoiceNo,
    supplierInvNo: billData.supplierInvNo,
    supplierInvDate: billData.supplierInvDate,
    taxMode: billData.taxMode,
    paymentTerms: billData.paymentTerms,
    dueDate: billData.dueDate,
    remarks: billData.remarks,
    items,                             // CLEAN items ✔
    amount,
    taxPercent,
    taxAmount,
    freightAmount,
    totalAmount,
  };

  try {
    await axios.post("/api/purchaseBill", payload);
    alert("Purchase Bill Saved Successfully");

    setItems([]);
    setBillData({
      ...billData,
      supplierInvNo: "",
      remarks: "",
    });
  } catch (err) {
    console.error(err);
    alert("Error saving bill");
  }
};



  // ================= GRID COLUMNS =================
  const itemColumns = [
    { field: "item", headerName: "Item", width: 180 },
    { field: "unit", headerName: "Unit", width: 90 },
    { field: "quantity", headerName: "Qty", width: 80 },
    { field: "rate", headerName: "Rate", width: 100 },
    { field: "amount", headerName: "Amount", width: 110 },
    { field: "taxPercent", headerName: "Tax %", width: 80 },
    { field: "taxAmount", headerName: "Tax Amt", width: 110 },
    { field: "freightAmount", headerName: "Freight", width: 100 },
    { field: "totalAmount", headerName: "Total", width: 120 },
    { field: "remarks", headerName: "Remarks", width: 180 },
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Purchase Bill</Typography>

      {/* ================= FORM ================= */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              select fullWidth label="GST Type" value={billData.gstType}
              onChange={(e) => setBillData({ ...billData, gstType: e.target.value })}
            >
              <MenuItem value="TaxInvoice">Tax Invoice</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              select fullWidth label="Cash / Credit" value={billData.cashOrCredit}
              onChange={(e) => setBillData({ ...billData, cashOrCredit: e.target.value })}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Credit">Credit</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={branches}
              getOptionLabel={(o) => o.name || ""}
              value={branches.find(b => b._id === billData.branch) || null}
              onChange={(e, v) => setBillData({ ...billData, branch: v?._id })}
              renderInput={(params) => <TextField {...params} label="Branch ★" />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={vendors}
              getOptionLabel={(o) => o.name || ""}
              value={vendors.find(v => v._id === billData.vendor) || null}
              onChange={(e, v) => {
                setBillData({ ...billData, vendor: v?._id, email: v?.email || "" });
                setVendorEmail(v?.email || "");
              }}
              renderInput={(params) => <TextField {...params} label="Vendor ★" />}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="Email" value={vendorEmail} disabled />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField type="date" fullWidth label="Date"
              InputLabelProps={{ shrink: true }}
              value={billData.date}
              onChange={(e) => setBillData({ ...billData, date: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="Supplier Inv No ★"
              value={billData.supplierInvNo}
              onChange={(e) => setBillData({ ...billData, supplierInvNo: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField type="date" fullWidth label="Supplier Inv Date"
              InputLabelProps={{ shrink: true }}
              value={billData.supplierInvDate}
              onChange={(e) => setBillData({ ...billData, supplierInvDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField select fullWidth label="Payment Terms"
              value={billData.paymentTerms}
              onChange={(e) => setBillData({ ...billData, paymentTerms: e.target.value })}
            >
              <MenuItem value="Advance">Advance</MenuItem>
              <MenuItem value="On Credit">On Credit</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField type="date" fullWidth label="Due Date"
              InputLabelProps={{ shrink: true }}
              value={billData.dueDate}
              onChange={(e) => setBillData({ ...billData, dueDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remarks"
              value={billData.remarks}
              onChange={(e) => setBillData({ ...billData, remarks: e.target.value })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ================= ITEMS ================= */}
      <Button variant="contained" onClick={() => setOpenDialog(true)}>+ Add Item</Button>
      <Paper sx={{ mt: 2 }}>
        <DataGrid rows={items} columns={itemColumns} autoHeight />
      </Paper>

      <Box textAlign="right" mt={3}>
        <Button variant="contained" size="large" onClick={handleSubmit}>Save Purchase Bill</Button>
      </Box>

      {/* ================= ADD ITEM DIALOG ================= */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Item" margin="dense"
            value={itemForm.item}
            onChange={(e) => {
              const it = itemList.find(i => i.itemName === e.target.value);
              setItemForm({ ...itemForm, itemId: it._id, item: it.itemName, unit: it.stockUnit || it.unit });
            }}
          >
            {itemList.map(it => (
              <MenuItem key={it._id} value={it.itemName}>
                {it.itemName} ({it.itemCode})
              </MenuItem>
            ))}
          </TextField>

          <TextField fullWidth label="Unit" margin="dense" value={itemForm.unit} disabled />

          <TextField type="number" label="Quantity" fullWidth margin="dense"
            value={itemForm.quantity}
            onChange={(e) => setItemForm({ ...itemForm, quantity: +e.target.value })}
          />

          <TextField type="number" label="Rate" fullWidth margin="dense"
            value={itemForm.rate}
            onChange={(e) => setItemForm({ ...itemForm, rate: +e.target.value })}
          />

          <TextField select fullWidth label="Tax %" margin="dense"
            value={itemForm.taxPercent}
            onChange={(e) => setItemForm({ ...itemForm, taxPercent: parseFloat(e.target.value) })}
          >
            {["0", "5", "12", "18", "28"].map(opt => (
              <MenuItem key={opt} value={parseFloat(opt)}>{opt}%</MenuItem>
            ))}
          </TextField>

          <TextField type="number" label="Freight Amount" fullWidth margin="dense"
            value={itemForm.freightAmount}
            onChange={(e) => setItemForm({ ...itemForm, freightAmount: +e.target.value })}
          />

          <TextField fullWidth label="Remarks" margin="dense"
            value={itemForm.remarks}
            onChange={(e) => setItemForm({ ...itemForm, remarks: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addItem}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
