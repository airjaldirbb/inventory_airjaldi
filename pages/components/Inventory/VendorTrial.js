import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress ,Button  } from "@mui/material";
import axios from "axios";
import { exportToExcel } from "@/utils/exportToExcel";

export default function VendorTrial() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalClosing, setTotalClosing] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/vendorTrial");
        const data = res.data.data || [];

        setRows(data);

        // calculate total closing balance
        const total = data.reduce((acc, vendor) => acc + (vendor.closingBalance || 0), 0);
        setTotalClosing(total);
      } catch (err) {
        console.error("Error fetching vendor trial:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: "vendorName", headerName: "Vendor Name", flex: 1 },
    { field: "debit", headerName: "Debit (Payment)", type: "number", flex: 1 },
    { field: "credit", headerName: "Credit (Purchase)", type: "number", flex: 1 },
    { field: "closingBalance", headerName: "Closing Balance", type: "number", flex: 1 },
  ];

  return (
    <Box sx={{ width: "100%" }}>
       <Button
        variant="outlined"
        color="success"
        sx={{ mb: 2 }}
        onClick={() =>
          exportToExcel({
            fileName: "vendor-trial.xlsx",
            sheetName: "Vendor Trial",
            columns,
            rows,
          })
        }
      >
        Export Excel
      </Button>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            getRowId={(row) => row.id}
            autoHeight
            disableSelectionOnClick
          />

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", pr: 2 }}>
            <Typography variant="h6">
              Total Closing Balance: {totalClosing.toLocaleString()}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}