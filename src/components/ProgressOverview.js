import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { supabase } from "../supabaseClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProgressOverview = ( visibleModal ) => {
  const [data, setData] = useState({
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Hours Logged",
        data: [0, 0, 0, 0, 0, 0, 0], // Default data
        backgroundColor: "#8FFFBA",
        borderColor: "#DFDFDF",
        borderWidth: 1,
      },
    ],
  });

  const fetchLoggedHours = async () => {
    const { data: timeLogs, error } = await supabase.from("weekly_time_logs").select("*").eq("id", 2);

    if (error) {
      console.error("Error fetching time logs:", error);
      return;
    }

    // Extracting and converting seconds to hours
    const { sun, mon, tue, wed, thu, fri, sat } = timeLogs[0];
    const convertedData = [
      (sun / 3600).toFixed(2),
      (mon / 3600).toFixed(2),
      (tue / 3600).toFixed(2),
      (wed / 3600).toFixed(2),
      (thu / 3600).toFixed(2),
      (fri / 3600).toFixed(2),
      (sat / 3600).toFixed(2),
    ];

    setData((prevData) => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: convertedData,
        },
      ],
    }));
  };

  useEffect(() => {
    fetchLoggedHours();
  }, [visibleModal]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours",
        },
      },
    },
  };

  return (
    <div>
      <h2>Progress Overview</h2>
      <Bar data={data} options={options} id="po_bar" className="mt-4" />
    </div>
  );
};

export default ProgressOverview;
