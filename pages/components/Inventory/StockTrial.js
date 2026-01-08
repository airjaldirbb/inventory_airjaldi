import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";

export default function StockTrial() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [branch, setBranch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  // Example branch list (replace with API fetch if needed)
  const branchList = [
    { _id: "1", name: "Main Branch" },
    { _id: "2", name: "Branch 2" },
  ];

  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "uom", headerName: "UOM", width: 80 },
    { field: "openingQty", headerName: "Opening Qty", width: 120 },
    { field: "stockIn", headerName: "Stock In", width: 100 },
    { field: "stockOut", headerName: "Stock Out", width: 100 },
    { field: "balanceQty", headerName: "Balance Qty", width: 120 },
    // { field: "transactionType", headerName: "Type", width: 150 },
    // { field: "referenceNo", headerName: "Reference No", width: 150 },
    // { field: "transactionDate", headerName: "Date", width: 150 },
  ];

  const fetchStockTrail = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (branch) params.append("branch", branch);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (search) params.append("search", search);

      const res = await fetch(`/api/stockTrail?${params.toString()}`);
      const data = await res.json();

      // map _id to id for DataGrid
      const rows = data.data.map((row, index) => ({
        id: row.itemId || index, // fallback if _id missing
        itemName: row.itemName,
        uom: row.uom,
        openingQty: row.openingQty,
        stockIn: row.stockIn,
        stockOut: row.stockOut,
        balanceQty: row.balanceQty,
        // transactionType: row.transactionType || "N/A",
        // referenceNo: row.referenceNo || "-",
        // transactionDate: row.transactionDate
        //   ? new Date(row.transactionDate).toLocaleDateString()
        //   : "-",
      }));

      setStockData(rows);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStockTrail();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Stock Trail
      </Typography>

      {/* Filters */}
      <Box mb={2}>
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
              {branchList.map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              label="End Date"
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
              color="primary"
              fullWidth
              onClick={fetchStockTrail}
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box height={600}>
        <DataGrid
          rows={stockData}
          columns={columns}
          loading={loading}
          pageSize={20}
          rowsPerPageOptions={[20, 50, 100]}
          disableSelectionOnClick
          autoHeight
        />
      </Box>
    </Box>
  );
}
