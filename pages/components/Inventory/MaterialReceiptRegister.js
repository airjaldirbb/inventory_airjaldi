import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { exportToExcel } from "@/utils/exportToExcel";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Paper,
} from "@mui/material";

export default function MaterialReceiptRegister() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const commonFieldProps = { size: "small", fullWidth: true };

    // Filters
    const [search, setSearch] = useState("");
    const [branch, setBranch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [branches, setBranches] = useState([]);

    /* ================= FETCH BRANCHES ================= */
    useEffect(() => {
        fetch("/api/branch")
            .then(res => res.json())
            .then(data => setBranches(data.data || []));
    }, []);

    /* ================= FETCH REGISTER ================= */

    const fetchRegister = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/receipt");
            console.log(res)
            const data = await res.json();

            const formattedRows = [];

            data.data.forEach((issue) => {
                issue.items.forEach((item, index) => {
                    formattedRows.push({
                        id: `${issue._id}-${index}`, // unique row id
                        partyName: issue.party || "-",
                        branchName: issue.branch?.name || "-", // populated branch name
                        itemName: item.itemId?.itemName || "-",
                        qty: item.qty,
                        uom: item.unit,
                        rate: item.rate,
                        amount: item.amount,
                        remarks: item.remarks || "",
                    });
                });
            });


            setRows(formattedRows);
        } catch (err) {
            console.error("Material Issue Register Error:", err);
        }
        setLoading(false);
    };



    useEffect(() => {
        fetchRegister();
    }, []);

    /* ================= GRID COLUMNS ================= */
    const columns = [
        { field: "partyName", headerName: "Party Name", flex: 1 },
        { field: "branchName", headerName: "Branch", width: 120 },
        { field: "itemName", headerName: "Item Name", flex: 1 },
        { field: "qty", headerName: "Qty", width: 80 },
        { field: "uom", headerName: "UOM", width: 80 },
        {
            field: "rate",
            headerName: "Rate",
            width: 120,
            //   valueFormatter: (p) => `₹ ${p.value?.toLocaleString()}`,
        },
        {
            field: "amount",
            headerName: "Issue Amount",
            width: 150,
            //   valueFormatter: (p) => `₹ ${p.value?.toLocaleString()}`,
        },
        { field: "remarks", headerName: "Remarks", flex: 1 },
    ];

    return (
        <Box p={3}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
                Material Receipt Register
            </Typography>
            <Button
            
                variant="outlined"
                color="success"
                sx={{ mb: 2 }}
                onClick={() =>
                    exportToExcel({
                        fileName: "materialReceiptRegister.xlsx",
                        sheetName: "Material Receipt Register",
                        columns,
                        rows,
                    })
                }
            >
                Export Excel
            </Button>
            {/* ================= FILTERS ================= */}
            {/* <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Search Item"
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2}>
                        <TextField
                            select
                            label="Branch"
                            fullWidth
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                        >
                            <MenuItem value="">All Branches</MenuItem>
                            {branches.map((b) => (
                                <MenuItem key={b._id} value={b._id}>
                                    {b.branchName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={2}>
                        <TextField
                            label="From Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2}>
                        <TextField
                            label="To Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ height: 56 }}
                            onClick={fetchRegister}
                        >
                            Filter
                        </Button>
                    </Grid>
                </Grid>
            </Paper> */}

            {/* ================= GRID ================= */}
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                autoHeight
                pageSize={20}
                rowsPerPageOptions={[20, 50, 100]}
                disableRowSelectionOnClick
            />
        </Box>
    );
}
