import { DataGrid } from "@mui/x-data-grid";
import { Button, Box, Typography, Snackbar ,Alert} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { exportToExcel } from "@/utils/exportToExcel";

export default function CustomerTrial() {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0, closingBalance: 0 });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  useEffect(() => {
    axios
      .get("/api/customerTrail")
      .then((res) => {
        const data = res.data.data || [];
        setRows(data);

        // Calculate totals
        const totalDebit = data.reduce((sum, row) => sum + (row.debit || 0), 0);
        const totalCredit = data.reduce((sum, row) => sum + (row.credit || 0), 0);
        const totalClosing = data.reduce((sum, row) => sum + (row.closingBalance || 0), 0);

        setTotals({ debit: totalDebit, credit: totalCredit, closingBalance: totalClosing });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/customerTrail?id=${id}`);
      const confirmed = window.confirm(
        "Are you sure you want to delete this record?"
      );

      if (!confirmed) return;
      setRows((prev) => prev.filter((row) => row.id !== id));

      setSnackbar({
        open: true,
        message: "Customer Trial deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error(error);

      setSnackbar({
        open: true,
        message: error?.response?.data?.error || "Delete failed",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };
  const columns = [
    { field: "customerId", headerName: "Customer ID", flex: 1 },
    { field: "customerName", headerName: "Customer Name", flex: 1 },
    { field: "company", headerName: "Network", flex: 1 },
    { field: "debit", headerName: "Debit (Sales)", type: "number", flex: 1 },
    { field: "credit", headerName: "Credit (Receipt)", type: "number", flex: 1 },
    // { field: "closingBalance", headerName: "Closing Balance", type: "number", flex: 1 },
    {
      field: "closingBalance",
      headerName: "Closing Balance",
      flex: 1,
      renderCell: (params) => params.value ?? "",
    },
    { field: "balanceType", headerName: "Balance Type", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      renderCell: (params) => (
        <Button
          color="error"
          size="small"
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
      ),
    }
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          color="success"
          onClick={() =>
            exportToExcel({
              fileName: "Customer-trial.xlsx",
              sheetName: "Customer Trial",
              columns,
              rows,
            })
          }
        >
          Export Excel
        </Button>
      </Box>
      <Box sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          getRowId={(row) => row.id}
          autoHeight
          disableSelectionOnClick
        />
      </Box>



      {/* Total row */}
      <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", gap: 4, pr: 2 }}>
        <Typography><strong>Total Debit:</strong> {totals.debit.toLocaleString()}</Typography>
        <Typography><strong>Total Credit:</strong> {totals.credit.toLocaleString()}</Typography>
        <Typography><strong>Total Closing:</strong> {totals.closingBalance.toLocaleString()}</Typography>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
