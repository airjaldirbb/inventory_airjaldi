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
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";

export default function PurchaseOrder() {
  const [branches, setBranches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorEmail, setVendorEmail] = useState("");
  const [itemList, setItemList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [openAddItem, setOpenAddItem] = useState(false);

  const unitsList = [
    "BAGS", "BALE", "BUNDLES", "BUCKLES", "BOX", "BOTTLES",
    "BUNCHES", "CANS", "CUBIC METER", "CUBIC CENTIMETER", "CENTIMETER",
    "CARTONS", "DOZEN", "DRUM", "GRAMS", "GROSS", "GROSS YARDS", "KILOGRAMS"
  ];

  const [poData, setPoData] = useState({
    gstType: "TaxInvoice",
    branch: "",
    vendor: "",
    email: "",
    deliveryDate: new Date().toISOString().substring(0, 10),
    orderDate: new Date().toISOString().substring(0, 10),
    refNo: "",
    refDate: new Date().toISOString().substring(0, 10),
    taxMode: "Exclusive",
    billingAddress: "",
    deliveryAt: "",
    paymentTerms: "",
    advanceAmount: 0,
    advanceLedger: null,
    attachments: [],
  });


  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [itemForm, setItemForm] = useState({
    item: "",
    itemName: "",
    unit: "",
    quantity: 0,
    rate: 0,
    taxPercent: 18,
    amount: 0,
    taxAmount: 0,
    total: 0,
    remarks: "",
  });


  const itemColumns = [
    { field: "itemName", headerName: "Item", width: 170 },
    { field: "unit", headerName: "Unit", width: 120 },
    { field: "quantity", headerName: "Qty", width: 90 },
    { field: "rate", headerName: "Rate", width: 110 },
    { field: "amount", headerName: "Amount", width: 120 },
    { field: "taxAmount", headerName: "Tax", width: 100 },
    { field: "total", headerName: "Total", width: 120 },
    { field: "remarks", headerName: "Remarks", width: 180 },
  ];

  useEffect(() => {
    loadBranches();
    loadVendors();
    fetchItems();
  }, []);

  const loadBranches = async () => {
    try {
      const res = await axios.get("/api/branch");
      setBranches(res.data);
    } catch (err) {
      console.error("Error loading branches:", err);
    }
  };

  const calculateItemTotals = (qty, rate, taxPercent) => {
    const amount = qty * rate;
    const taxAmount = (amount * taxPercent) / 100;
    return {
      amount,
      taxAmount,
      total: amount + taxAmount,
    };
  };


  const loadVendors = async () => {
    try {
      const res = await axios.get("/api/vendorApi");
      setVendors(res.data);
    } catch (err) {
      console.error("Error loading vendors:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/item");
      setItemList(res.data.data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleVendorChange = (vendorId) => {
    const vendor = vendors.find((v) => v._id === vendorId);
    setPoData({ ...poData, vendor: vendorId, email: vendor?.email || "" });
    setVendorEmail(vendor?.email || "");
  };

  const addItem = () => {
    if (!itemForm.item || itemForm.quantity <= 0 || itemForm.rate <= 0) {
      return alert("Item, Quantity and Rate are required");
    }

    setItems(prev => [
      ...prev,
      {
        id: prev.length + 1,
        item: itemForm.item,           // ObjectId
        itemName: itemForm.itemName,   // For UI
        unit: itemForm.unit,
        quantity: itemForm.quantity,
        rate: itemForm.rate,
        taxPercent: itemForm.taxPercent,
        taxAmount: itemForm.taxAmount,
        amount: itemForm.amount,
        total: itemForm.total,
        remarks: itemForm.remarks,
      },
    ]);

    setOpenDialog(false);
    setItemForm({
      item: "",
      itemName: "",
      unit: "",
      quantity: 0,
      rate: 0,
      taxPercent: 18,
      amount: 0,
      taxAmount: 0,
      total: 0,
      remarks: "",
    });
  };

  const handleSubmit = async () => {
    if (!poData.branch) return alert("Please select a Branch");
    if (!poData.vendor) return alert("Please select a Vendor");
    if (!poData.refDate) return alert("Ref Date is required");
    if (items.length === 0) return alert("Please add at least one item");

    try {
      const payload = {
        ...poData,
        items: items.map(i => ({
          item: i.item,
          quantity: i.quantity,
          rate: i.rate,
          taxPercent: i.taxPercent,
        })),
      };

      // Convert empty advanceLedger to null
      if (!payload.advanceLedger) payload.advanceLedger = null;


      await axios.post("/api/purchaseOrder", payload);

      alert("✅ Purchase Order Saved Successfully!");

      setItems([]);
      setPoData({
        gstType: "TaxInvoice",
        branch: "",
        vendor: "",
        email: "",
        deliveryDate: new Date().toISOString().substring(0, 10),
        orderDate: new Date().toISOString().substring(0, 10),
        orderNo: "",
        refNo: "",
        refDate: new Date().toISOString().substring(0, 10),
        taxMode: "Exclusive",
        billingAddress: "",
        deliveryAt: "",
        paymentTerms: "",
        advanceAmount: 0,
        // advanceLedger: null,
        attachments: [],
      });
    } catch (err) {
      console.error("❌ Error saving PO:", err);
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors)
          .map((e) => e.message)
          .join("\n");
        alert("Validation Error:\n" + messages);
      } else if (err.response?.data?.message) {
        alert("Error: " + err.response.data.message);
      } else {
        alert("Unexpected error saving Purchase Order");
      }
    }
  };

  const totalAmount = items.reduce((acc, i) => acc + i.amount, 0);
  const clearItemDialog = () => {
    setSelectedItem(null);
    setQuantity(1);
    setRate(0);
    setAmount(0);
    setSelectedUnit("");
    setFormState(prev => ({ ...prev, tax: "" }));
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Purchase Order</Typography>

      {/* ======================= FORM ======================= */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          {/* GST Type */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField size="small"
              select fullWidth label="GST Type" value={poData.gstType}
              onChange={(e) => setPoData({ ...poData, gstType: e.target.value })}>
              <MenuItem value="TaxInvoice">Tax Invoice</MenuItem>
            </TextField>
          </Grid>

          {/* Branch */}
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              sx={{ minWidth: 180 }}
              fullWidth
              options={branches}
              size="small"
              getOptionLabel={(option) => option.name || ""}
              value={branches.find(b => b._id === poData.branch) || null}
              onChange={(_, value) => {
                setPoData({ ...poData, branch: value?._id || "" });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Branch ★" fullWidth />
              )}
            />

          </Grid>

          {/* Vendor */}
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              size="small"
              sx={{ minWidth: 180 }}
              options={vendors}
              getOptionLabel={(option) => option.name || ""}
              value={vendors.find(v => v._id === poData.vendor) || null}
              onChange={(_, value) => {
                setPoData({
                  ...poData,
                  vendor: value?._id || "",
                  email: value?.email || "",
                });
                setVendorEmail(value?.email || "");
              }}
              renderInput={(params) => (
                <TextField {...params} label="Vendor ★" fullWidth />
              )}
            />

          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField size="small" sx={{ minWidth: 180 }}
              fullWidth label="Email" value={vendorEmail} disabled />
          </Grid>

          {/* Delivery & Order Dates */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField size="small"
              type="date" fullWidth label="Delivery Date ★"
              value={poData.deliveryDate}
              onChange={(e) => setPoData({ ...poData, deliveryDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField size="small"    sx={{
      minWidth: 180,
      '& input::-webkit-calendar-picker-indicator': {
        filter: 'invert(1)', // 🔥 makes icon white in dark mode
        cursor: 'pointer',
      },
    }}
              type="date" fullWidth label="Order Date ★"
              value={poData.orderDate}
              onChange={(e) => setPoData({ ...poData, orderDate: e.target.value })}
              InputLabelProps={{ shrink: true }} />
          </Grid>

          {/* Order & Ref No */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField size="small" sx={{ minWidth: 180 }}
              fullWidth label="Order No ★" value={poData.orderNo}
              onChange={(e) => setPoData({ ...poData, orderNo: e.target.value })} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth size="small" 
              label="Ref No" value={poData.refNo}
              onChange={(e) => setPoData({ ...poData, refNo: e.target.value })} />
          </Grid>

          {/* Ref Date */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField size="small"    sx={{
      minWidth: 180,
      '& input::-webkit-calendar-picker-indicator': {
        filter: 'invert(1)', // 🔥 makes icon white in dark mode
        cursor: 'pointer',
      },
    }}
              type="date" fullWidth label="Ref Date ★"
              value={poData.refDate}
              onChange={(e) => setPoData({ ...poData, refDate: e.target.value })}
              InputLabelProps={{ shrink: true }} />
          </Grid>

          {/* Tax Mode */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField size="small" sx={{ minWidth: 180 }}
              select fullWidth label="Tax Mode"
              value={poData.taxMode}
              onChange={(e) => setPoData({ ...poData, taxMode: e.target.value })}>
              <MenuItem value="Exclusive">Exclusive</MenuItem>
              <MenuItem value="Inclusive">Inclusive</MenuItem>
            </TextField>
          </Grid>

        </Grid>
      </Paper>

      {/* ======================= ITEM GRID + BUTTON ======================= */}
      <Box mb={2}>
        <Button variant="outlined" onClick={() => setOpenDialog(true)}>+ Add Item</Button>
      </Box>

      <Paper elevation={3}>
        <DataGrid
          rows={items}
          columns={itemColumns}
          autoHeight
          disableSelectionOnClick
        />
        <Box p={2} textAlign="right">
          <Typography variant="subtitle1"><b>Total: ₹{totalAmount.toFixed(2)}</b></Typography>
        </Box>
      </Paper>

      {/* ======================= SAVE BUTTON ======================= */}
      <Box textAlign="right" mt={3}>
        <Button variant="outlined" size="large" onClick={handleSubmit}>
          Save Purchase Order
        </Button>
      </Box>

      {/* ======================= ADD ITEM DIALOG ======================= */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <Dialog
          open={openAddItem}
          onClose={() => {
            clearItemDialog();
            setOpenAddItem(false);
          }}
          fullWidth
          maxWidth="sm"
        ></Dialog>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Item"
            fullWidth
            margin="dense"
            value={itemForm.item}
            onChange={(e) => {
              const selected = itemList.find(i => i._id === e.target.value);

              if (!selected) return;

              const calc = calculateItemTotals(
                itemForm.quantity,
                itemForm.rate,
                itemForm.taxPercent
              );

              setItemForm({
                ...itemForm,
                item: selected._id,
                itemName: selected.itemName,
                unit: selected.stockUnit, // ✅ AUTO PICK UNIT
                ...calc,
              });
            }}
          >
            {itemList.map(it => (
              <MenuItem key={it._id} value={it._id}>
                {it.itemName} ({it.itemCode})
              </MenuItem>
            ))}
          </TextField>
          {/* 
          <TextField
            select
            fullWidth
            label="Select Item"
            value={selectedItem?._id || ""}
            onChange={(e) => {
              const item = items.find(i => i._id === e.target.value);

              if (!item) {
                clearItemDialog();
                return;
              }

              setSelectedItem(item);
              setRate(item.rate || 0);
              setQuantity(1);
              setSelectedUnit(item.stockUnit || "Pcs");
            }}
            sx={{ mt: 2 }}
          >
            {items.map(i => (
              <MenuItem key={i._id} value={i._id}>
                {i.itemName}
              </MenuItem>
            ))}
          </TextField> */}
          <TextField
            fullWidth
            label="Unit"
            margin="dense"
            value={itemForm.unit}   // ✅ CORRECT
            InputProps={{ readOnly: true }}
          />




          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={itemForm.quantity}
            onChange={(e) => {
              const q = +e.target.value || 0;
              const calc = calculateItemTotals(q, itemForm.rate, itemForm.taxPercent);
              setItemForm({ ...itemForm, quantity: q, ...calc });
            }}
          />

          <TextField
            label="Rate (₹)"
            type="number"
            fullWidth
            margin="dense"
            value={itemForm.rate}
            onChange={(e) => {
              const r = +e.target.value || 0;
              const calc = calculateItemTotals(itemForm.quantity, r, itemForm.taxPercent);
              setItemForm({ ...itemForm, rate: r, ...calc });
            }}
          />

          {/* TAX FIELD */}
          <TextField
            select
            fullWidth
            label="Tax"
            margin="dense"
            value={itemForm.taxPercent}
            onChange={(e) => {
              const tax = +e.target.value;
              const calc = calculateItemTotals(itemForm.quantity, itemForm.rate, tax);
              setItemForm({ ...itemForm, taxPercent: tax, ...calc });
            }}
          >
            {[5, 12, 18, 28].map(t => (
              <MenuItem key={t} value={t}>{t}%</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Tax Amount"
            fullWidth
            margin="dense"

            value={itemForm.taxAmount.toFixed(2)}
          />

          <TextField
            label="Total"
            fullWidth
            margin="dense"

            value={itemForm.total.toFixed(2)}
          />


          <TextField
            label="Remarks"
            fullWidth
            multiline
            margin="dense"
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
