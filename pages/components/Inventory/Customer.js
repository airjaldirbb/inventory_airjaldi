"use client";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useRef } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';

import { CleaningServices } from "@mui/icons-material";

export default function Customer() {
  const controllerRef = useRef(null);
  const [rows, setRows] = useState([]); // Local customers
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [formState, setFormState] = useState({});
  const [phone, setPhone] = useState("");
  const [confirmMode, setConfirmMode] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, _id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [searchText, setSearchText] = useState("");
  const [newRowData, setNewRowData] = useState({
    custName: "",
    code: "",
    phone: "",
    email: "",
    city: "",
    company: "",
    location: "",
    gst: "",
    user: "Tester",
    ledger: "General Ledger",
    serialTrackingEnabled: false,
  });



  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("/api/customer");
        setRows(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  const handleSaveAdd = async () => {
    const requiredFields = ["custName", "code", "phone", "email", "city", "company", "location", "gst"];
    for (let field of requiredFields) {
      if (!newRowData[field]) {
        setSnackbar({ open: true, message: `${field} is required!`, severity: "error" });
        return;
      }
    }

    try {
      const res = await axios.post("/api/customer", newRowData, { headers: { "Content-Type": "application/json" } });
      setRows(prev => [...prev, { ...newRowData, _id: res.data._id || Date.now() }]);
      setSnackbar({ open: true, message: "Customer added successfully!", severity: "success" });
      setAddOpen(false);
      setNewRowData({ custName: "", code: "", phone: "", email: "", city: "", company: "", location: "", gst: "", user: "Tester", ledger: "General Ledger", serialTrackingEnabled: false });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to add customer!", severity: "error" });
    }
  };

  const handleEditRow = (row) => {
    setEditRow(row);
    setFormState(row);
  };

  const handleConfirm = async () => {
    if (confirmMode === "save" && editRow) {
      const requiredFields = ["custName", "code", "phone", "email", "city", "company", "location", "gst"];
      for (let field of requiredFields) {
        if (!formState[field]) {
          setSnackbar({ open: true, message: `${field} is required!`, severity: "error" });
          return;
        }
      }

      try {
        const res = await axios.put(`/api/customer?id=${editRow._id}`, formState);
        setRows(prev => prev.map(r => (r._id === editRow._id ? res.data : r)));
        setSnackbar({ open: true, message: "Customer updated successfully!", severity: "success" });
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: "Failed to update customer!", severity: "error" });
      } finally {
        setEditRow(null);
        setConfirmMode(null);
      }
    } else {
      setEditRow(null);
      setConfirmMode(null);
    }
  };

  const handleOpenDeleteConfirm = (_id) => setDeleteConfirm({ open: true, _id });
  const handleDeleteCustomer = async () => {
    try {
      await axios.delete(`/api/customer?id=${deleteConfirm._id}`);
      setRows(prev => prev.filter(r => r._id !== deleteConfirm._id));
      setSnackbar({ open: true, message: "Customer deleted successfully!", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete customer!", severity: "error" });
    } finally {
      setDeleteConfirm({ open: false, _id: null });
    }
  };



  const columns = [
    
    { field: "edit", headerName: "Edit", width: 80, renderCell: params => <Button color="primary" onClick={() => handleEditRow(params.row)} size="small"><EditIcon /></Button> },
    { field: "delete", headerName: "Delete", width: 90, renderCell: params => <Button color="error" onClick={() => handleOpenDeleteConfirm(params.row._id)} size="small"><DeleteIcon /></Button> },
    { field: "_id", headerName: "Customer ID", width: 100 },
    { field: "code", headerName: "Code", width: 120 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "city", headerName: "City", width: 120 },

    { field: "location", headerName: "Location", width: 150 },
    { field: "gst", headerName: "GST", width: 120 },
    { field: "user", headerName: "User", width: 120 },
    // extra fields


    {
      field: "company",
      headerName: "Company",
      width: 180,
      renderCell: (params) => {
        const row = params.row;

        // ✅ Handles all cases
        return (
          row.company ||          // Mongo saved
          row.company_name ||     // raw Jaze fallback
          row.User?.company_name || // if nested
          "—"
        );
      },
    },
    { field: "groupName", headerName: "Group", width: 150 },
    { field: "profileName", headerName: "Profile", width: 150 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "connectionType", headerName: "Connection Type", width: 150 },
    { field: "clientType", headerName: "Client Type", width: 150 },
  ];

  // Combine local customers and AirJaldi search results
  const combinedRows = rows.filter((row) =>
    Object.values(row).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );
  // Inside Customer component
  const fetchUserDetails = async (phoneNumber) => {
    if (!phoneNumber) {
      console.log("No phone number entered");
      return;
    }

    try {
      const res = await axios.get(
        `/api/jazeApi?type=phone&value=${phoneNumber}`
      );
      let responseData = res.data?.data || [];
      // ✅ ALWAYS work with array
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      // ✅ Extract ONLY User objects
      const users = responseData
        .filter(item => item?.User)
        .map(item => {
          const user = item.User;
          const gstNumber = item.UserSetting?.gstNumber || "";
          return {
            _id: String(user.id),
            custName: `${user.name || ""} ${user.last_name || ""}`.trim(),
            code: user.username || "",
            phone: user.phone || "",
            email: user.email || "",
            city: user.address_city || "",
            location: user.address_line1 || "",
            gst: gstNumber,
            user: "AirJaldi",
            company: user.company_name || "",
            groupName: user.group_name || "",
            profileName: user.profile_name || "",
            status: user.status || "",
            connectionType: user["Connection Type"] || "",
            clientType: user["Client Type"] || "",
          };
        });
      // ✅ Merge into grid
      setRows(prev => {
        const newRows = users.filter(
          u => !prev.some(p => String(p._id) === String(u._id))
        );
        return [...prev, ...newRows];
      });

    } catch (err) {
      console.error("Error fetching AirJaldi user:", err);
    }
  };
  return (
    <>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          flexDirection: {
            xs: "column",   // mobile
            sm: "row"       // tablet+
          },
          alignItems: {
            xs: "stretch",
            sm: "center"
          }
        }}
      >
        <Button variant="outlined" onClick={() => setAddOpen(true)} ><AddIcon/>Add Customer</Button>
        {/* <TextField
          label="Search by Phone"
          variant="outlined"
          size="small"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          sx={{ width: 250 }}
        /> */}
      </Box>
      {/* <Button variant="contained" onClick={() => fetchUserDetails(phone)}>
        🔍 Test Fetch
      </Button> */}
      <Box sx={{ width: "100%", overflowX: "auto" }}>
      
          <DataGrid
            rows={combinedRows}
            columns={columns}
            getRowId={(row) => row._id}
            autoHeight
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-main": {
                overflow: "visible",
              },
            }}
          />
      
      </Box>
      {/* <DataGrid
        rows={combinedRows}
        columns={columns}
        getRowId={(row) => row._id}
        pageSize={10}
        disableRowSelectionOnClick
      /> */}
      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          {["custName", "code", "phone", "email", "city", "company", "location", "gst"].map(field => (
            <TextField key={field} margin="dense" label={field.charAt(0).toUpperCase() + field.slice(1)} fullWidth value={newRowData[field]} onChange={e => setNewRowData({ ...newRowData, [field]: e.target.value })} />
          ))}
          {/* <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <Typography sx={{ mr: 1 }}>Enable Serial Tracking:</Typography>
            <Switch checked={newRowData.serialTrackingEnabled} onChange={e => setNewRowData({ ...newRowData, serialTrackingEnabled: e.target.checked })} />
            <Typography>{newRowData.serialTrackingEnabled ? "ON" : "OFF"}</Typography>
          </Box> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveAdd} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editRow} onClose={() => setEditRow(null)} fullWidth maxWidth="sm">
        <DialogTitle>{confirmMode ? (confirmMode === "save" ? "Confirm Save" : "Discard Changes?") : "Edit Customer"}</DialogTitle>
        <DialogContent>
          {confirmMode ? (
            <Typography sx={{ mt: 2 }}>{confirmMode === "save" ? "Are you sure you want to save these changes?" : "Discard changes?"}</Typography>
          ) : (
            ["custName", "code", "phone", "email", "city", "company", "location", "gst"].map(field => (
              <TextField key={field} margin="dense" label={field.charAt(0).toUpperCase() + field.slice(1)} fullWidth value={formState[field] || ""} onChange={e => setFormState({ ...formState, [field]: e.target.value })} />
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirm}>{confirmMode ? "No" : "Cancel"}</Button>
          <Button onClick={() => setConfirmMode(confirmMode ? confirmMode : "save")} variant="contained">{confirmMode ? "Yes" : "Save"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, _id: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this customer?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, _id: null })}>Cancel</Button>
          <Button onClick={handleDeleteCustomer} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}