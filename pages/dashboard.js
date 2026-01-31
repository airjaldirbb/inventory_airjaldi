import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Container,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Layout from "./components/Layout";

// Inventory Components
import ItemMaster from "./components/Inventory/ItemMaster";
import ItemList from "./components/Inventory/ItemList";
import MaterialIssue from "./components/Inventory/MaterialIssue";
import MaterialReceipt from "./components/Inventory/MaterialReceipt";
import StockManagment from "./components/Inventory/StockManagment";
import SalesInvoice from "./components/Inventory/SalesInvoice";
import Customer from "./components/Inventory/Customer";
import PaymentReceipt from "./components/Inventory/PaymentReceipt";
import Vendor from "./components/Inventory/Vendor";
import PurchaseOrder from "./components/Inventory/PurchaseOrder";
import PurchaseBill from "./components/Inventory/PurchaseBill";
import BillPayment from "./components/Inventory/BillPayment";
import AllReports from "./components/Inventory/AllReports";
import CustomerTrial from "./components/Inventory/CustomerTrial";
import VendorTrial from "./components/Inventory/VendorTrial";
// Charts
import KendoGrid from "./KendoGrid";
import PieCharts from "./PieCharts";
import BardCharts from "./BardCharts";
import SalesInvoiceRegister from "./components/Inventory/salesInvoiceRegister";
import PurchaseInvoiceRegisterGrid from "./components/Inventory/purchaseInvoiceRegister";
import StockTrail from "./components/Inventory/StockTrial";
import MaterialIssueRegister from "./components/Inventory/MaterialIssueRegister";
import MaterialReceiptRegister from "./components/Inventory/MaterialReceiptRegister";
/* =====================================================
   🔹 TAB REGISTRY (SINGLE SOURCE OF TRUTH)
===================================================== */
const TAB_REGISTRY = {
  analytics: { label: "Dashboard Analytics", component: <AnalyticsContent /> },
  itemMaster: { label: "Item Master", component: <ItemMaster /> },
  itemList: { label: "Item List", component: <ItemList /> },
  materialIssue: { label: "Material Issue", component: <MaterialIssue /> },
  materialReceipt: { label: "Material Receipt", component: <MaterialReceipt /> },
  stockManagement: { label: "Stock Management", component: <StockManagment /> },
  salesInvoice: { label: "Sales Invoice", component: <SalesInvoice /> },
  customer: { label: "Customer", component: <Customer /> },
  paymentReceipt: { label: "Payment Receipt", component: <PaymentReceipt /> },
  vendor: { label: "Vendor", component: <Vendor /> },
  purchaseOrder: { label: "Purchase Order", component: <PurchaseOrder /> },
  purchaseBill: { label: "Purchase Bill", component: <PurchaseBill /> },
  billPayment: { label: "Bill Payment", component: <BillPayment /> },
  customerTrial: { label: "Customer Trial", component: <CustomerTrial /> },
  vendorTrial: { label: "Vendor Trial", component: <VendorTrial /> },
  salesInvoiceRegister: { label: "Sales Invoice Register", component: <SalesInvoiceRegister /> },
  stockTrail: { label: "Stock Trial", component: <StockTrail /> },
  allReports: {
    label: "All Reports",
    render: (addTab) => <AllReports addTab={addTab} />,
  },
  purchaseInvoiceRegister: {
    label: "Purchase Invoice Register",
    component: <PurchaseInvoiceRegisterGrid />,
  },
  materialIssueRegister: {
    label: "Material Issue Register",
    component: <MaterialIssueRegister />,
  },
  materialreceiptRegister: { label: "Material Receipt Register", component: <MaterialReceiptRegister /> },
};

/* =====================================================
   🔹 LOCAL STORAGE UTILITIES
===================================================== */
const STORAGE_KEY = "dashboardTabs";

const loadTabsFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

const saveTabsToStorage = (tabs, activeTab) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTab }));
};

/* =====================================================
   🔹 DASHBOARD
===================================================== */
export default function Dashboard() {
  // Restore state from localStorage on initial render
  const stored = loadTabsFromStorage();

  const [tabs, setTabs] = useState(
    stored?.tabs?.length ? stored.tabs : [{ id: "analytics" }]
  );
  const [activeTab, setActiveTab] = useState(stored?.activeTab || "analytics");

  /* =====================================================
     🔹 SAVE TO LOCAL STORAGE
  ===================================================== */
  useEffect(() => {
    saveTabsToStorage(tabs, activeTab);
  }, [tabs, activeTab]);

  /* =====================================================
     🔹 ADD / CLOSE TAB ACTIONS
  ===================================================== */
  const addTab = (id) => {
    if (!TAB_REGISTRY[id]) return;
    if (!tabs.find((t) => t.id === id)) {
      setTabs([...tabs, { id }]);
    }
    setActiveTab(id);
  };

  const closeTab = (id) => {
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id && newTabs.length) {
      setActiveTab(newTabs[0].id);
    }
  };

  /* =====================================================
     🔹 RENDER
  ===================================================== */
  return (
    <Layout
      onMenuClick={(menuItem) => {
        const map = {
          "/ItemMaster": "itemMaster",
          "/ItemList": "itemList",
          "/MaterialIssue": "materialIssue",
          "/MaterialReceipt": "materialReceipt",
          "/StockManagement": "stockManagement",
          "/SalesInvoice": "salesInvoice",
          "/Customer": "customer",
          "/PaymentReceipt": "paymentReceipt",
          "/Vendor": "vendor",
          "/PurchaseOrder": "purchaseOrder",
          "/PurchaseBill": "purchaseBill",
          "/BillPayment": "billPayment",
          "/AllReports": "allReports",
          "/CustomerTrial": "customerTrial",
          "/VendorTrial": "vendorTrial",
          "/StockTrail": "stockTrail",

        };
        if (map[menuItem.path]) addTab(map[menuItem.path]);
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
                  {TAB_REGISTRY[tab.id]?.label}
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
          {TAB_REGISTRY[activeTab]?.render
            ? TAB_REGISTRY[activeTab].render(addTab)
            : TAB_REGISTRY[activeTab]?.component}
        </Box>
      </Box>
    </Layout>
  );
}

/* =====================================================
   🔹 ANALYTICS CONTENT
===================================================== */
function AnalyticsContent() {
  return (
    <Box sx={{ p: 3, backgroundColor: "#0086c7", minHeight: "100%" }}>
      <Container maxWidth="xl">
        <Typography variant="h4" align="center" gutterBottom fontWeight={600} color="#fff">
          Dashboard Analytics
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">Bar Chart Insights</Typography>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={6}>
              <KendoGrid />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">Distribution Overview</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}><PieCharts type="donut" /></Grid>
            <Grid item xs={12} sm={4}><PieCharts type="donut" /></Grid>
            <Grid item xs={12} sm={4}><PieCharts type="donut" /></Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Pie Chart Analysis</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}><BardCharts type="pie" /></Grid>
            <Grid item xs={12} sm={4}><BardCharts type="pie" /></Grid>
            <Grid item xs={12} sm={4}><BardCharts type="pie" /></Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
