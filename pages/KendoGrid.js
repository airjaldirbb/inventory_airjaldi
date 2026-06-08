"use client";

import { PieChart } from "@mui/x-charts/PieChart";
import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function KendoGrid() {
    const [loading, setLoading] = useState(true);

    const [dashboardData, setDashboardData] = useState({
        sales: 0,
        outstanding: 0,
        purchases: 0,
        payable: 0,
        salesBranchTransfer: 0,
        purchaseBranchTransfer: 0,
    });

    /* =========================================
       FETCH DASHBOARD DATA
    ========================================= */
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [
                    salesRes,
                    purchaseRes,
                    customerTrialRes,
                    vendorTrialRes,
                    salesBranchRes,
                    purchaseBranchRes,
                ] = await Promise.all([
                    axios.get("/api/salesInvoiceREgister"),
                    axios.get("/api/purchaseInvoiceRegister"),
                    axios.get("/api/customerTrail"),
                    axios.get("/api/vendorTrial"),
                    axios.get("/api/SalesBranchTransfer"),
                    axios.get("/api/PurchaseBranchTransfer"),
                ]);

                /* =========================
                   SALES
                   Sales Invoice Register
                ========================= */
                // const sales =
                //     Number(salesRes?.data?.invoiceAmount) || 0;
                const sales = (salesRes?.data?.data || []).reduce((sum, item) => {
                    const amount =
                        Number(item.rate || 0) + Number(item.taxAmount || 0);

                    return sum + amount;
                }, 0);

                setDashboardData(sales);
                /* =========================
                   PURCHASES
                   Purchase Invoice Register
                ========================= */
                const purchases =
                    Number(purchaseRes?.data?.totalAmount) || 0;

                /* =========================
                   OUTSTANDING
                   Customer Trial
                ========================= */
                const customerData =
                    customerTrialRes?.data?.data || [];

                const outstanding = customerData.reduce(
                    (acc, item) =>
                        acc + Number(item.closingBalance || 0),
                    0
                );

                /* =========================
                   PAYABLE
                   Vendor Trial
                ========================= */
                const vendorData =
                    vendorTrialRes?.data?.data || [];

                const payable = vendorData.reduce(
                    (acc, item) =>
                        acc + Number(item.closingBalance || 0),
                    0
                );

                /* =========================
                   SALES BRANCH TRANSFER
                ========================= */
                const salesBranchData =
                    salesBranchRes?.data?.data || [];

                const salesBranchTransfer =
                    salesBranchData.reduce(
                        (acc, item) =>
                            acc + Number(item.netAmount || 0),
                        0
                    );

                /* =========================
                   PURCHASE BRANCH TRANSFER
                ========================= */
                const purchaseBranchData =
                    purchaseBranchRes?.data?.data || [];

                const purchaseBranchTransfer =
                    purchaseBranchData.reduce(
                        (acc, item) =>
                            acc + Number(item.netAmount || 0),
                        0
                    );

                setDashboardData({
                    sales,
                    outstanding,
                    purchases,
                    payable,
                    salesBranchTransfer,
                    purchaseBranchTransfer,
                });
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    /* =========================================
       CHART CONFIG
    ========================================= */
    const chartConfigs = [
        {
            title: "Sales",
            values: [Number(dashboardData.sales.toFixed(2))],
            labels: ["Sales Invoice Register"],
            colors: ["#FF6384"],
        },
        {
            title: "Outstanding",
            values: [Number(dashboardData.outstanding.toFixed(2))],
            labels: ["Customer Trial"],
            colors: ["#8E44AD"],
        },
        {
            title: "Purchases",
            values: [Number(dashboardData.purchases.toFixed(2))],
            labels: ["Purchase Invoice Register"],
            colors: ["#FFCE56"],
        },
        {
            title: "Payables",
            values: [Number(dashboardData.payable.toFixed(2))],
            labels: ["Vendor Trial"],
            colors: ["#ec5b2f"],
        },
        {
            title: "Sales Branch Transfer",
            values: [
                Number(
                    dashboardData.salesBranchTransfer.toFixed(2)
                ),
            ],
            labels: ["Sales Branch Transfer Register"],
            colors: ["#f071cc"],
        },
        {
            title: "Purchase Branch Transfer",
            values: [
                Number(
                    dashboardData.purchaseBranchTransfer.toFixed(2)
                ),
            ],
            labels: ["Purchase Branch Transfer Register"],
            colors: ["#3e86de"],
        },
    ];
    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "50vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    return (
        <Box sx={{ justifyContent: "center", mt: "3rem" }}>
            <Grid
                container
                spacing={2}
                sx={{
                    overflowX: "auto",
                    justifyContent: "center",
                    alignItems: "center", minHeight: "50vh"
                }}
            >
                {chartConfigs.map((config, index) => {
                    const data = config.values.map((value, i) => ({
                        id: i,
                        value,
                        label:
                            config.labels[i] || `Item ${i + 1}`,
                        color:
                            config.colors[
                            i % config.colors.length
                            ],
                    }));

                    return (
                        <Grid
                            item
                            key={index}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            sx={{ display: "flex" }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    p: 2,
                                    boxShadow: 20,
                                    borderRadius: 2,
                                    width: "100%",
                                    height: "100%",
                                    minHeight: 300,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 1,
                                        textAlign: "center",
                                        width: "100%",
                                        minHeight: 40,
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
                                                arcLabel: (item) =>
                                                    `${item.value}`,
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