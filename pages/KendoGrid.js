"use client";
import { PieChart } from '@mui/x-charts/PieChart';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Box, Grid, Typography } from "@mui/material";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function KendoGrid() {

    const chartConfigs = [
        {
            title: "Sales",
            values: [120],
            labels: ["Online"],
            colors: ["#FF6384"],
        },
        {
            title: "Purchases",
            values: [200,],
            labels: ["Domestic"],
            colors: ["#FFCE56"],
        },
        {
            title: "Payables",
            values: [300],
            labels: ["Due", "Paid"],
            colors: ["#99f071"],
        },
        {
            title: "Orders",
            values: [200,],
            labels: ["Local"],
            colors: ["#4BC0C0",],
        },
        {
            title: "Expenses",
            values: [300],
            labels: ["Fixed"],
            colors: ["#8E44AD"],
        },
    ];

    return (
        <>

            <Box sx={{ justifyContent: 'center' }}>
                <Grid
                    container
                    spacing={2}
                    wrap="nowrap" // ⬅️ prevent wrapping
                    sx={{
                        overflowX: "auto", // ⬅️ enable horizontal scroll
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
                                <Typography align="center" variant="h6">
                                    {config.title}
                                </Typography>
                                <PieChart
                                    series={[{ innerRadius: 70, outerRadius: 100, data, arcLabel: "value" }]}
                                    width={200}
                                    height={200}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>




        </>

    );
}
