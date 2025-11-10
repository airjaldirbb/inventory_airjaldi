import React from 'react'
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { useState,useEffect } from 'react';
import { TextField, MenuItem, Typography, Button } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from 'axios';
import { DataGrid } from "@mui/x-data-grid";
import BarcodeForm from './BarCode';

export default function SalesInvoice() {
  // const [rows, setRows] = useState([]);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: (theme.vars ?? theme).palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }));

   const [rows, setRows] = useState([]);
  const [formState, setFormState] = useState({
    gstType: "",
    taxInvoice: "",
    cashCredit: "",
    credit: "",
    branch: "",
    customer: "",
    email: "",
    date: "2025-10-30",
    invoiceNo: "050",
    refNo: "",
    refDate: "2025-10-30",
    agent: "",
    salesman: "",
    tax: "",
  });

  const columns = [
    {
      field: "edit",
      headerName: "Edit",
      width: 90,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
        // onClick={() => handleEditRow(params.row)}
        >
          <EditIcon />
        </Button>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 90,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
        // onClick={() => handleOpenDeleteConfirm(params.row._id)}
        >
          <DeleteIcon />
        </Button>
      ),
    },
    { field: "_id", headerName: "ID", width: 200 },
    { field: "itemName", headerName: "Item Name", width: 150 },
    { field: "itemCode", headerName: "Item Code", width: 150 },
    { field: "underGroup", headerName: "Under Group", width: 150 },
    { field: "stockUnit", headerName: "Stock Unit", width: 150 },
    { field: "gstClassification", headerName: "GST Classification", width: 180 },
    { field: "openingStock", headerName: "Opening Stock", width: 150 },
  ];


    const [formStateBranch, setFormStateBranch] = useState({ branch: "" });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    // Replace with your actual API endpoint
    axios
      .get("/api/branch") 
      .then((response) => {
        setBranches(response.data); 
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
        setLoading(false);
      });
  }, []);




  return (
    <>
    <BarcodeForm/>
      <Box sx={{ width: '100%', borderRadius: '2px', boxShadow: 'black', borderColor: 'red' }}>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid size={6} container spacing={2}>
            {/* GST Type */}
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="GST Type"
                value={formState.gstType || ""}
                onChange={(e) => setFormState({ ...formState, gstType: e.target.value })}
              >
                {["TaxInvoice", "Registered", "Composition"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Cash/Credit */}
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Cash / Credit"
                value={formState.cashCredit || ""}
                onChange={(e) => setFormState({ ...formState, cashCredit: e.target.value })}
              >
                {["Cash", "Credit"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>


            {/* Branch */}
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Branch ★"
                value={formState.branch || ""}
                onChange={(e) => setFormState({ ...formState, branch: e.target.value })}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch._id} value={branch._id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Customer */}
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Customer ★"
                value={formState.customer || ""}
                onChange={(e) => setFormState({ ...formState, customer: e.target.value })}
              >
                {["Customer A", "Customer B", "Customer C"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Email (Text Field) */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formState.email || ""}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              />
            </Grid>
          </Grid>
          <Grid size={6} container spacing={2}>

            <Grid size={12}>
              <TextField
                label="Date ★"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={formState.date}
                onChange={(e) => setFormState({ ...formState, date: e.target.value })}
              />
            </Grid>

            {/* Invoice No */}
            <Grid size={12}>
              <TextField
                label="Invoice No"
                fullWidth
                value={formState.invoiceNo}
                onChange={(e) =>
                  setFormState({ ...formState, invoiceNo: e.target.value })
                }
              />
            </Grid>

            {/* Ref No */}
            <Grid size={12}>
              <TextField
                label="Ref No"
                fullWidth
                value={formState.refNo}
                onChange={(e) =>
                  setFormState({ ...formState, refNo: e.target.value })
                }
              />
            </Grid>

            {/* Ref Date */}
            <Grid size={12}>
              <TextField
                label="Ref. Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formState.refDate}
                onChange={(e) =>
                  setFormState({ ...formState, refDate: e.target.value })
                }
              />
            </Grid>

            {/* Agent */}
            <Grid size={12}>
              <TextField
                select
                label="Agent"
                fullWidth
                value={formState.agent}
                onChange={(e) => setFormState({ ...formState, agent: e.target.value })}
              >
                {["Agent 1", "Agent 2", "Agent 3"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Salesman */}
            <Grid size={12}>
              <TextField
                select
                label="Salesman"
                fullWidth
                value={formState.salesman}
                onChange={(e) =>
                  setFormState({ ...formState, salesman: e.target.value })
                }
              >
                {["John Doe", "Jane Smith", "Alex Kumar"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Tax */}
            <Grid size={12}>
              <TextField
                select
                label="Tax"
                fullWidth
                value={formState.tax}
                onChange={(e) => setFormState({ ...formState, tax: e.target.value })}
              >
                {["5%", "12%", "18%", "28%"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Grid>

      </Box>

      <Box margin={2}>
        <Box sx={{ height: 300, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={5}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{
              noRowsOverlay: () => (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="body1" fontWeight="500">
                    No records to display
                  </Typography>
                </Box>
              ),
            }}
          />


        </Box>
      </Box>
      <Box>
       remarks
      </Box>
    </>
  )
}
