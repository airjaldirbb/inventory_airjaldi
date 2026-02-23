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
                    axios.get("/api/customerTrail")                // Vendor Trial API

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
            values: [Number(closingBalanceTotal.toFixed(2))], // ✅ now working
            labels: ["Payables"],
            colors: ["#99f071"],
        },


    ];

    return (
        <Box sx={{ justifyContent: 'center',minHeight:'50vh', mt:'10rem' }}>
            <Grid
                container
                spacing={2}
                wrap="nowrap"
                sx={{
                    overflowX: "auto",
                    flexWrap: "nowrap",
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
                        <Grid item key={index} sx={{ flex: "0 0 auto" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",   // horizontally center
                                    justifyContent: "flex-start", // ensure title stays at top of chart
                                }}
                            >
                                {/* <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 1,
                                        textAlign: "center",  // center text above pie
                                        width: "100%",        // full width so it doesn’t shift
                                    }}
                                >
                                    {config.title}
                                </Typography> */}

                                <PieChart
                                    series={[
                                        {
                                            innerRadius: 60,
                                            outerRadius: 100,
                                            data,
                                            arcLabel: (item) => `${item.value}`, // show label
                                            labelStyle: {
                                                fontSize: 18,   // 🔥 increase label size here
                                                fontWeight: 700,
                                                fill: "#000",
                                            },
                                        },
                                    ]}
                                    width={250}
                                    height={200}
                                />
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}