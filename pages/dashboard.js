import { useState } from "react";
import { Box, Tabs, Tab, IconButton, Container, Typography, Paper, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Layout from "./components/Layout";
import ItemMaster from "./components/Inventory/ItemMaster";
import KendoGrid from "./KendoGrid";
import PieCharts from "./PieCharts";
import BardCharts from "./BardCharts";
import MaterialIssue from "./components/Inventory/MaterialIssue";
import MaterialReceipt from "./components/Inventory/MaterialReceipt";
import SalesInvoice from "./components/Inventory/SalesInvoice";
import StockManagment from "./components/Inventory/StockManagment";
import Customer from "./components/Inventory/Customer";
import PaymentReceipt from "./components/Inventory/PaymentReceipt";
import Vendor from "./components/Inventory/Vendor";
import PurchaseOrder from "./components/Inventory/PurchaseOrder";
import PurchaseBill from "./components/Inventory/PurchaseBill";
import BillPayment from "./components/Inventory/BillPayment";

export default function Dashboard() {
  const [tabs, setTabs] = useState([
    { id: "analytics", label: "Dashboard Analytics", content: <AnalyticsContent /> },
  ]);
  const [activeTab, setActiveTab] = useState("analytics");

  const addTab = (id, label, content) => {
    if (!tabs.find((tab) => tab.id === id)) {
      setTabs([...tabs, { id, label, content }]);
    }
    setActiveTab(id);
  };

  const closeTab = (id) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  return (
    <Layout
      onMenuClick={(menuItem) => {
        if (menuItem.path === "/ItemMaster") {
          addTab("itemMaster", "Item Master", <ItemMaster />);
        }
        if (menuItem.path === "/MaterialIssue") {
          addTab("materialissue", "Material Issue", <MaterialIssue />);
        }
        if (menuItem.path === "/MaterialReceipt") {
          addTab("materialReceipt", "Material Receipt", <MaterialReceipt />);
        }
        if (menuItem.path === "/StockManagement") {
          addTab("Stock Management", "Stock Managment", <StockManagment />);
        }
        if (menuItem.path === "/SalesInvoice") {
          addTab("Sales Invoice", "Sales Invoice", <SalesInvoice />);
        }
        if (menuItem.path === "/Customer") {
          addTab("Customer", "Customer", <Customer />);
        }
        if (menuItem.path === "/PaymentReceipt") {
          addTab("Payment Receipt", "Payment Receipt", <PaymentReceipt />);
        }

        //purchase
        if (menuItem.path === "/Vendor") {
          addTab("Vendor", "Vendor", <Vendor />);
        }
            if (menuItem.path === "/PurchaseOrder") {
          addTab("Purchase Order", "Purchase Order", <PurchaseOrder />);
        }
            if (menuItem.path === "/PurchaseBill") {
          addTab("Purchase Bill", "Purchase Bill", <PurchaseBill />);
        }
            if (menuItem.path === "/BillPayment") {
          addTab("Bill Payment", "Bill Payment", <BillPayment />);
        }
      }}
    >
      <Box sx={{ p: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {tab.label}
                  {tab.id !== "analytics" && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </Box>
      </Box>
    </Layout>
  );
}

function AnalyticsContent() {
  return (
    <Box sx={{ p: 3, backgroundColor: "rgba(240, 245, 250, 1)", minHeight: "100%" }}>
      <Container maxWidth="xl">
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          Dashboard Analytics
        </Typography>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Bar Chart Insights
          </Typography>
          <Grid container spacing={3} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={6}>
              <KendoGrid />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Distribution Overview
          </Typography>
          <Grid container spacing={3} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={4}>
              <PieCharts type="donut" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <PieCharts type="donut" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <PieCharts type="donut" />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pie Chart Analysis
          </Typography>
          <Grid container spacing={3} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={4}>
              <BardCharts type="pie" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <BardCharts type="pie" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <BardCharts type="pie" />
            </Grid>
          </Grid>
        </Paper>
      </Container>

    </Box>
  );
}
