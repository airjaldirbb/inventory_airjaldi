import React, { useState } from 'react'
import { DataGrid,gridtoolbarc } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {
  Button, Stack, Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, TextField, Container
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
export default function ItemMaster() {
  const [nbRows, setNbRows] = React.useState(3);

  const [rowSelectionModel, setRowSelectionModel] = React.useState({
    type: 'include',
    ids: new Set(),
  });
  const [rows, setRows] = useState([
    { id: 1, firstName: "John", lastName: "Doe", age: 30 },
    { id: 2, firstName: "Jane", lastName: "Smith", age: 25 },
  ]);
  const [editRow, setEditRow] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({ firstName: "", lastName: "", age: "" });
  // const handleAdd = () => {
  //   const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
  //   const newRow = { id: newId, firstName: "New", lastName: "User", age: 20 };
  //   setRows((prev) => [...prev, newRow]);
  // };
  const handleAdd = () => {
    setNewRowData({ firstName: "", lastName: "", age: "" }); // reset form
    setAddOpen(true);
  };

  const handleSaveAdd = () => {
    const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const newRow = {
      id: newId,
      firstName: newRowData.firstName,
      lastName: newRowData.lastName,
      age: Number(newRowData.age),
    };

    setRows((prev) => [...prev, newRow]);
    setAddOpen(false);
  };
  const handleEditRow = (row) => {
    setEditRow(row);
  };

  const handleSaveEdit = () => {
    setRows((prev) => prev.map((row) => (row.id === editRow.id ? editRow : row)));
    setEditRow(null);
  };

  const handleDeleteRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };


  const [selectionModel, setSelectionModel] = useState([]);
  const handleDeleteAll = () => {
    setRows([]);
    setSelectionModel([]);
  };
  // const handleDeleteSelected = () => {
  //   if (selectionModel.length === 0) return;
  //   setRows((prev) => prev.filter((row) => !selectionModel.includes(row.id)));
  //   setSelectionModel([]);
  // };

  const columns = [
    {
      field: "edit",
      headerName: "Edit",
      width: 90,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          size='small'
          onClick={() => handleEditRow(params.row)}
        >
          <EditIcon />
        </Button>
      ),
    },

    {
      field: "actions",
      headerName: "Delete",
      width: 90,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          onClick={() => handleDeleteRow(params.row.id)}
        >
          <DeleteIcon />
        </Button>

      ),
    },


    { field: "id", headerName: "ID", width: 10 },
    { field: "firstName", headerName: "First name", width: 150, editable: true },
    { field: "lastName", headerName: "Last name", width: 150, editable: true },
    { field: "age", headerName: "Age", type: "number", width: 110, editable: true },

  ];




  return (
    <>
      <Box>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={handleAdd}>
            Add Row
          </Button>

          <Button
            variant="contained"
            size='small'
            color="error"
            onClick={handleDeleteAll}
            disabled={rows.length === 0}
          >
            Delete All
          </Button>
        </Stack>

      </Box>
      <Box sx={{ height: 600, width: '100%', overflowX: "hidden" }}>


        <DataGrid
          rowHeight={30}
          rows={rows}
          columns={columns}
          checkboxSelection

          disableRowSelectionOnClick
          // processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(err) => alert(err.message)}
          onRowSelectionModelChange={(newSelection) =>
            setSelectionModel(Array.isArray(newSelection) ? newSelection : [newSelection])
          }

        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
            borderTop: "1px solid #ddd",
            background: "#fafafa",
          }}
        >
          <div style={{ fontWeight: 500 }}>Total Items: {rows.length}</div>
        </Box>
        <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
          <DialogTitle>Add New Row</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="First Name"
              fullWidth
              value={newRowData.firstName}
              onChange={(e) =>
                setNewRowData({ ...newRowData, firstName: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Last Name"
              fullWidth
              value={newRowData.lastName}
              onChange={(e) =>
                setNewRowData({ ...newRowData, lastName: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Age"
              type="number"
              fullWidth
              value={newRowData.age}

              
              onChange={(e) =>
                setNewRowData({ ...newRowData, age: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAdd} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!editRow} onClose={() => setEditRow(null)}>
          <DialogTitle>Edit Row</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="First Name"
              fullWidth
              value={editRow?.firstName || ""}
              onChange={(e) =>
                setEditRow({ ...editRow, firstName: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Last Name"
              fullWidth
              value={editRow?.lastName || ""}
              onChange={(e) =>
                setEditRow({ ...editRow, lastName: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Age"
              type="number"
              fullWidth
              value={editRow?.age || ""}
              onChange={(e) =>
                setEditRow({ ...editRow, age: Number(e.target.value) })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditRow(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

    </>
  );
}
