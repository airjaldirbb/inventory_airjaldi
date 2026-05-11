import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';


import axios from "axios";
import { Autocomplete } from "@mui/material";

const BillPayment = () => {
  const [formData, setFormData] = useState({
    vendor: "",
    date: new Date().toISOString().substring(0, 10),
    cashBank: "",
    amount: "",
    refNo: "",
    refDate: new Date().toISOString().substring(0, 10),
    remark: "",
  });
  const commonFieldProps = { size: "small", fullWidth: true };


  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const loadVendors = async () => {
    try {
      const res = await axios.get("/api/vendorApi");
      setVendors(res.data);
    } catch (err) {
      console.error("Error loading vendors:", err);
    }
  };
  // Load saved records
  const fetchRecords = async () => {
    try {
      const res = await axios.get("/api/billPayment");
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching bill payments:", err);
    }
  };

  // Load branches for autocomplete
  const loadBranches = async () => {
    try {
      const res = await axios.get("/api/branch");
      setBranches(res.data);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
    loadBranches();
    loadVendors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.vendor) return alert("Please select a Vendor");

    const payload = {
      payments: [
        {
          vendor: formData.vendor,
          date: formData.date,
          cashBank: formData.cashBank,
          amount: Number(formData.amount),
          chequeNo: formData.refNo, // mapped to API
          chequeDate: formData.refDate, // mapped to API
          remark: formData.remark,
        },
      ],
    };

    try {
      await axios.post("/api/billPayment", payload, {
        headers: { "Content-Type": "application/json" },
      });
      fetchRecords();
      setFormData({
        vendor: "",
        date: new Date().toISOString().substring(0, 10),
        cashBank: "",
        amount: "",
        refNo: "",
        refDate: new Date().toISOString().substring(0, 10),
        remark: "",
      });
    } catch (err) {
      console.error("Error saving bill payment:", err);
      alert("Error submitting bill payment");
    }
  };

  const columns = [
    {
      field: "vendor",
      headerName: "Vendor",
      flex: 1,
      renderCell: (params) => params.row?.vendor?.name || "",
    },
    { field: "amount", headerName: "Amount", flex: 1 },
    { field: "chequeNo", headerName: "Ref No", flex: 1 },
    {
      field: "chequeDate",
      headerName: "Ref Date",
      flex: 1,
      renderCell: (params) =>
        params.row?.chequeDate
          ? new Date(params.row.chequeDate).toLocaleDateString()
          : "",
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) =>
        params.row?.date
          ? new Date(params.row.date).toLocaleDateString()
          : "",
    },
  ];

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Bill Payment
      </Typography>

      {/* FORM */}
      <Paper sx={{ p: 3, mb: 4, width: "100%" }}>
        <Grid container spacing={2}  columns={{ xs: 4, sm: 8, md: 12 }}>
          {/* Branch Autocomplete */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              {...commonFieldProps}

              sx={{

                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              options={vendors}
              getOptionLabel={(option) => option.name || ""}
              value={vendors.find(v => v._id === formData.vendor) || null}
              onChange={(_, value) => {
                setFormData({
                  ...formData,
                  vendor: value?._id || "",
                  email: value?.email || "",
                });
                // 

              }}
              renderInput={(params) => (
                <TextField {...params} label="Vendor ★" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>            <TextField
            {...commonFieldProps}

            sx={{

              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)', // 🔥 makes icon white in dark mode
                cursor: 'pointer',
              },
            }}
            fullWidth
            type="date"
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          </Grid>

          <Grid item xs={12} sm={6}>            <TextField
            {...commonFieldProps}

            sx={{

              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)', // 🔥 makes icon white in dark mode
                cursor: 'pointer',
              },
            }}
            fullWidth
            label="Cash / Bank A/C"
            name="cashBank"
            value={formData.cashBank}
            onChange={handleChange}
          />
          </Grid>

          <Grid item xs={12} sm={6}>            <TextField
            {...commonFieldProps}

            sx={{

              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)', // 🔥 makes icon white in dark mode
                cursor: 'pointer',
              },
            }}
            fullWidth
            type="number"
            label="Amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />
          </Grid>

          <Grid item xs={12} sm={6}>            <TextField
            {...commonFieldProps}

            sx={{

              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)', // 🔥 makes icon white in dark mode
                cursor: 'pointer',
              },
            }}
            fullWidth
            label="Reference No"
            name="refNo"
            value={formData.refNo}
            onChange={handleChange}
          />
          </Grid>

          <Grid item xs={12} sm={6}>            <TextField
            {...commonFieldProps}

            sx={{

              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)', // 🔥 makes icon white in dark mode
                cursor: 'pointer',
              },
            }}
            fullWidth
            type="date"
            label="Reference Date"
            name="refDate"
            value={formData.refDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          </Grid>

          <Grid item xs={12} sm={6}>            <TextField
            {...commonFieldProps}

            sx={{

              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)', // 🔥 makes icon white in dark mode
                cursor: 'pointer',
              },
            }}
            fullWidth
            multiline
            rows={2}
            label="Remark"
            name="remark"
            value={formData.remark}
            onChange={handleChange}
          />
          </Grid>

          <Grid item xs={12}>
            <Button variant="outlined" onClick={handleSubmit}>
              Save Bill Payment
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* RECORDS GRID */}
      <Typography variant="h6" gutterBottom>
        Saved Records
      </Typography>

      <Box sx={{ overflowX: "auto", width: "100%"}}>
        <DataGrid
          rows={records}
          columns={columns}
          getRowId={(row) => row._id}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
        />
      </Box>
    </>

  );
};

export default BillPayment;
