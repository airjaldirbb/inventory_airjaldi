import React from "react";
import { useRouter } from "next/router";

import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Link,
  Divider // ✅ add this
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
export default function AllReports({ addTab }) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
        All Reports
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {/* Customer / Sales */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={cardStyle}>
            <CardContent sx={{ textAlign: "center" }}>
              <AssessmentIcon sx={iconStyle} />
              <Typography variant="h6" gutterBottom>
                Customer / Sales
              </Typography>

              <Divider sx={{ mb: 1 }} />

              <Link
                component="button"
                underline="hover"
                onClick={() => addTab("salesInvoiceRegister")}
              >
                Sales Invoice Register
              </Link>
              
            </CardContent>
          </Card>
        </Grid>

        {/* Vendor / Purchase */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={cardStyle}>
            <CardContent sx={{ textAlign: "center" }}>
              <ShoppingCartIcon sx={iconStyle} />
              <Typography variant="h6" gutterBottom>
                Vendor / Purchase
              </Typography>

              <Divider sx={{ mb: 1 }} />

              <Link
                component="button"
                underline="hover"
                onClick={() => addTab("purchaseInvoiceRegister")}
              >
                Purchase Invoice Register
              </Link>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Reports */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={cardStyle}>
            <CardContent sx={{ textAlign: "center" }}>
              <InventoryIcon sx={iconStyle} />
              <Typography variant="h6" gutterBottom>
                Inventory Reports
              </Typography>

              <Divider sx={{ mb: 1 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Link
                  component="button"
                  underline="hover"
                  onClick={() => addTab("stockTrial")}
                >
                  Stock Trial (Warehouse)
                </Link>

                <Link
                  component="button"
                  underline="hover"
                  onClick={() => addTab("materialReceipt")}
                >
                  Material Receipt
                </Link>

                <Link
                  component="button"
                  underline="hover"
                  onClick={() => addTab("materialIssue")}
                >
                  Material Issue
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
/* Styles */
const cardStyle = {
  height: "100%",
  transition: "0.3s",
  "&:hover": {
    boxShadow: 6,
  },
};

const iconStyle = {
  fontSize: 40,
  color: "primary.main",
  mb: 1,
};