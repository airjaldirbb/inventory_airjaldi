"use client";
import { PieChart } from '@mui/x-charts/PieChart';
import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Box, Grid, Typography } from "@mui/material";
import axios from 'axios';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function KendoGrid() {
    const [loading, setLoading] = useState(true);
    const [salesTotal, setSalesTotal] = useState(0);
    const [purchaseTotal, setPurchaseTotal] = useState(0);
    const [closingBalanceTotal, setClosingBalanceTotal] = useState(0); // ✅ compute from vendorTrial array
    const [outstandingTotal, setOutstandingTotal] = useState(0);       // Customer Outstanding
    useEffect(() => {
        const fetchTotals = async () => {
            try {
                const [salesRes, purchaseRes, vendorTrialRes, customerTrialRes] = await Promise.all([
                    axios.get("/api/salesInvoiceREgister"),    // Sales API
                    axios.get("/api/purchaseInvoiceRegister"), // Purchase API
                    axios.get("/api/vendorTrial"),
                    axios.get("/api/customerTrail"),              // Vendor Trial API
                    axios.get("/api/SalesBranchTransfer"),
                    axios.get("/api/PurchaseBranchTransfer")
                ]);

                // Sales total
                setSalesTotal(salesRes.data.totalAmount || 0);

                // Purchase total
                setPurchaseTotal(purchaseRes.data.totalAmount || 0);

                // Compute total closing balance from vendorTrial array
                const vendorData = vendorTrialRes.data.data || [];
                const totalClosing = vendorData.reduce(
                    (acc, vendor) => acc + (vendor.closingBalance || 0),
                    0
                );
                // Customer Outstanding = sum of closing balances
                const customerData = customerTrialRes.data.data || [];
                const totalOutstanding = customerData.reduce(
                    (acc, customer) => acc + (customer.closingBalance || 0),
                    0
                );
                setOutstandingTotal(totalOutstanding);

                setClosingBalanceTotal(totalClosing);

            } catch (error) {
                console.error("Error fetching totals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTotals();
    }, []);

    const chartConfigs = [
        {
            title: "Sales",
            values: [Number(salesTotal.toFixed(2))],
            labels: ["Sales"],
            colors: ["#FF6384"],
        },
        {
            title: "OutStanding",
            values: [Number(outstandingTotal.toFixed(2))],
            labels: ["OutStanding"],
            colors: ["#8E44AD"],
        },
        {
            title: "Purchases",
            values: [Number(purchaseTotal.toFixed(2))],
            labels: ["Purchases"],
            colors: ["#FFCE56"],
        },
        {
            title: "Payables",
            values: [Number(closingBalanceTotal.toFixed(2))],
            labels: ["Payables"],
            colors: ["#ec5b2f"],
        },
        {
            title: "Sales Branch Transfer",
            values: [Number(closingBalanceTotal.toFixed(2))],
            labels: ["Sales Branch"],
            colors: ["#f071cc"],
        },
        {
            title: "Purchase Branch Transfer",
            values: [Number(closingBalanceTotal.toFixed(2))],
            labels: ["Purchase Branch"],
            colors: ["#3e86de"],
        },


    ];

    return (
        <Box sx={{ justifyContent: 'center', minHeight: '50vh', mt: '5rem' }}>
            <Grid
                container
                spacing={2}
                sx={{
                    overflowX: "auto",

                    justifyContent: 'center',

                    alignItems: 'center'
                }}
            >
                {chartConfigs.map((config, index) => {
                    const data = config.values.map((value, i) => ({
                        id: i,
                        value,
                        label: config.labels[i] || `Item ${i + 1}`,
                        color: config.colors[i % config.colors.length],
                    }));

                    return (
                        <Grid
                            item
                            key={index}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            sx={{ display: "flex" }} // ✅ IMPORTANT
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "space-between", // ✅ equal spacing
                                    p: 2,
                                    boxShadow: 2,
                                    borderRadius: 2,
                                    width: "100%",
                                    height: "100%", // ✅ equal height for all
                                    minHeight: 300, // ✅ force uniform height
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 1,
                                        textAlign: "center",
                                        width: "100%",
                                        minHeight: 40, // ✅ equal title height (fix alignment issue)
                                    }}
                                >
                                    {config.title}
                                </Typography>

                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <PieChart
                                        series={[
                                            {
                                                innerRadius: 50,
                                                outerRadius: 90,
                                                data,
                                                arcLabel: (item) => `${item.value}`,
                                            },
                                        ]}
                                        width={210}   
                                        height={200}
                                    />
                                </Box>
                            </Box>
                        </Grid>

                    );
                })}
            </Grid>
        </Box>
    );
}