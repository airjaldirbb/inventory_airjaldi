"use client"; // for Next.js 13 app directory
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

export default function VendorPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgers, setLedgers] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [vendorData, setVendorData] = useState({
    gstNo: "",
    name: "",
    printName: "",
    identificationCode: "",
    vendorType: "Common",
    isSubVendor: false,
    email: "",
  });

  const vendorTypes = [
    { id: 1, name: "Common" },
    { id: 2, name: "SubVendor" },
  ];

  // Fetch vendor list
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/vendorApi");
        console.log(res,"vendro")
      setVendors(res.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchVendors();
  // }, []);
const handleDeleteVendor = async (_id) => {
  if (!window.confirm("Are you sure you want to delete this vendor?")) return;

  try {
    await axios.delete(`/api/vendorApi?id=${_id}`); // ✅ FIX
    fetchVendors();
  } catch (err) {
    console.error("Error deleting vendor:", err);
    alert(err.response?.data?.message || "Failed to delete vendor");
  }
};



  const fetchDropdowns = async () => {
    try {
      const res = await axios.get("/api/vendorApi?dropdown=true");
    
      setLedgers(res.data.ledgers || []);
      // Optionally set default underLedger
      if (res.data.ledgers?.length > 0) {
        setVendorData((prev) => ({
          ...prev,
          underLedger: res.data.ledgers[0].id
        }));
      }
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  useEffect(() => {
    fetchVendors(); // fetch vendor list
    fetchDropdowns(); // fetch ledgers + vendor types
  }, []);
  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVendorData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle create vendor
  const handleSubmit = async () => {
    if (!vendorData.gstNo) {
      alert("GST No is mandatory");
      return;
    }

    try {
      await axios.post("/api/vendorApi", { vendors: [vendorData] });
      setOpenDialog(false);
      setVendorData({
        gstNo: "",
        name: "",
        printName: "",
        identificationCode: "",
        vendorType: "Common",
        isSubVendor: false,
        email: "",
      });
      fetchVendors();
    } catch (err) {
      console.error("Error creating vendor:", err);
      alert(err.response?.data?.message || "Error creating vendor");
    }
  };

  // Columns for DataGrid
  const columns = [
    { field: "gstNo", headerName: "GST No", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "printName", headerName: "Print Name", width: 150 },
    { field: "identificationCode", headerName: "Code", width: 100 },
    { field: "vendorType", headerName: "Type", width: 120 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "isSubVendor", headerName: "Sub Vendor", width: 120, type: "boolean" },
      {
    field: "actions",
    headerName: "Actions",
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Button
        color="error"
        size="small"
        onClick={() => handleDeleteVendor(params.row.id)}
      >
        Delete
      </Button>
    ),
  },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Vendors
      </Typography>

      <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ mb: 2 }}>
        Create New Vendor
      </Button>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={vendors.map((v) => ({ ...v, id: v._id }))}
          columns={columns}
          loading={loading}
          pageSize={5}
        />
      </div>

      {/* Dialog for Creating Vendor */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Vendor</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="GST No ★"
            name="gstNo"
            value={vendorData.gstNo}
            onChange={handleChange}
            required
          />
          <TextField
            label="Name"
            name="name"
            value={vendorData.name}
            onChange={handleChange}
          />
          <TextField
            label="Print Name"
            name="printName"
            value={vendorData.printName}
            onChange={handleChange}
          />
          <TextField
            label="Identification Code"
            name="identificationCode"
            value={vendorData.identificationCode}
            onChange={handleChange}
          />
          <TextField
            select
            label="Vendor Type"
            name="vendorType"
            value={vendorData.vendorType}
            onChange={handleChange}
          >
            {vendorTypes.map((type) => (
              <MenuItem key={type.id} value={type.name}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Under Ledger ★"
            name="underLedger"
            value={vendorData.underLedger}
            onChange={handleChange}
            required
          >
            {ledgers.map((ledger) => (
              <MenuItem key={ledger.id} value={ledger.id}>
                {ledger.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Email"
            name="email"
            type="email"
            value={vendorData.email}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
