// 📋 React Component: components/StockAdjustmentForm.js
import { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  TextareaAutosize, Container,
  Grid
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { Snackbar, Alert } from "@mui/material";
export default function StockAdjustmentForm() {
  const commonFieldProps = { size: "small", fullWidth: true };

  const [branches, setBranches] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [formData, setFormData] = useState({
    branch: "",
    item: "",
    adjustmentType: "INCREASE",
    quantity: 0,
    reason: "Manual Correction",
    remarks: "",
    adjustedBy: "",
    approvedBy: ""
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [branchRes, itemRes, userRes, adjustmentRes] = await Promise.all([
          axios.get("/api/branch"),
          axios.get("/api/item"),
          axios.get("/api/auth/login"),
          axios.get("/api/stockAdjustment"),
        ]);


        // The key here depends on how your API returns data
        setBranches(branchRes.data.data || branchRes.data || []);
        setItems(itemRes.data.data || []);
        setUsers(userRes.data.data || []);
        setAdjustments(adjustmentRes.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        showSnackbar("Failed to load initial data", "error");
      }
    }
    fetchData();
  }, []);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/stockAdjustment", formData);
      showSnackbar("Adjustment recorded successfully!");
      setAdjustments((prev) => [...prev, res.data.data]);
    } catch (err) {
      console.error(err);
      showSnackbar("Error submitting adjustment", "error");
    }
    setFormData({
      branch: "",
      item: "",
      adjustmentType: "INCREASE",
      quantity: 0,
      reason: "Manual Correction",
      remarks: "",
      adjustedBy: "",
      approvedBy: ""
    });
  };

  const columns = [
    { field: "itemName", headerName: "Item", flex: 1 },
    { field: "branchName", headerName: "Branch", flex: 1 },
    { field: "adjustmentType", headerName: "Type", flex: 1 },
    { field: "quantity", headerName: "Qty", type: "number", flex: 1 },
    { field: "reason", headerName: "Reason", flex: 1 },
    { field: "adjustedByName", headerName: "Adjusted By", flex: 1 },
    { field: "approvedByName", headerName: "Approved By", flex: 1 }
  ];

  const rows = (adjustments || []).map((adj) => ({
    id: adj._id,
    itemName: adj.item?.itemName || "",
    branchName: adj.branch?.name,
    adjustmentType: adj.adjustmentType,
    quantity: adj.quantity,
    reason: adj.reason,
    adjustedByName: adj.adjustedBy?.name || "",
    approvedByName: adj.approvedBy?.name || ""
  }));
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
  });
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
  return (
    <Container maxWidth="xl" >
      <Typography variant="h4" gutterBottom>Stock Adjustment</Typography>
      <Grid
        container
        spacing={2}
        component="form"
        onSubmit={handleSubmit}
        sx={{ mb: 4 }}
      >

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="branch-label"
            >Branch</InputLabel>
            <Select
              {...commonFieldProps

              } sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}

              labelId="branch-label"
              name="branch"
              value={formData.branch}
              label="Branch"
              onChange={handleChange}
              required
            >
              {branches.length ? (
                branches.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.name} {b.code ? `(${b.code})` : ""}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No branches available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel >Item</InputLabel>
            <Select name="item"
              value={formData.item}
              onChange={handleChange}
              {...commonFieldProps

              } sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              required>
              {(items || []).map((i) => (
                <MenuItem key={i._id} value={i._id}>{i.itemName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Adjustment Type</InputLabel>
            <Select
              name="adjustmentType"
              {...commonFieldProps

              } sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              value={formData.adjustmentType}
              onChange={handleChange} required>
              <MenuItem value="INCREASE">INCREASE</MenuItem>
              <MenuItem value="DECREASE">DECREASE</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Quantity"
            {...commonFieldProps

            } sx={{
              minWidth: 180,
              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)', // 🔥 makes icon white in dark mode
                cursor: 'pointer',
              },
            }}
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Reason</InputLabel>
            <Select name="reason"
              {...commonFieldProps

              } sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              value={formData.reason}
              onChange={handleChange}>
              <MenuItem value="Damage">Damage</MenuItem>
              <MenuItem value="Loss">Loss</MenuItem>
              <MenuItem value="Audit Correction">Audit Correction</MenuItem>
              <MenuItem value="Manual Correction">Manual Correction</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>



        <Grid item xs={12} sm={6} md={3}>

          <FormControl fullWidth>
            <InputLabel>Adjusted By</InputLabel>
            <Select
              name="adjustedBy"
              value={formData.adjustedBy}
              {...commonFieldProps

              } sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              onChange={handleChange} required>
              {(users || []).map((u) => (
                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Approved By</InputLabel>
            <Select name="approvedBy"
              {...commonFieldProps

              } sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              value={formData.approvedBy}
              onChange={handleChange}>
              <MenuItem value="">None</MenuItem>
              {(users || []).map((u) => (
                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextareaAutosize

            minRows={3}
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Remarks (optional)"
            style={{ width: "100%", padding: "8px" }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Button type="submit" variant="outlined" color="success"
          >Submit Adjustment</Button>
        </Grid>
      </Grid>


      <Typography variant="h5" gutterBottom>Adjustment History</Typography>
      <Box sx={{ height: 400 }}>
        <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} />
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
