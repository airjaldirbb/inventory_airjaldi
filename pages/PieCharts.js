import { Box ,Grid,Typography} from '@mui/material';
import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart';

export default function PieCharts() {
      const datasets = [
    {
      title: "",
      data: [
        { id: 0, value: 10, label: "Series A" },
        { id: 1, value: 15, label: "Series B" },
        { id: 2, value: 20, label: "Series C" },
      ],
      colors: ["#FF6384", "#36A2EB", "#FFCE56"], // custom colors
    },
   
  ];
    return (
        <>
    <Grid container spacing={3} wrap="nowrap" sx={{ overflowX: "auto" }}>
      {datasets.map((set, index) => (
        <Grid item key={index} sx={{ flex: "0 0 auto", textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            {set.title}
          </Typography>
          <PieChart
            series={[
              {
                data: set.data.map((item, i) => ({
                  ...item,
                  color: set.colors[i], // apply custom colors here
                })),
              },
            ]}
            width={200}
            height={200}
          />
        </Grid>
      ))}

    </Grid>
   
 
        </>
    )
}
