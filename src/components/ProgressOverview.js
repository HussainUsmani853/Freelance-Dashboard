import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import dayjs from "dayjs";
import { supabase } from "../supabaseClient";

const ProgressOverview = () => {
  const [dailyLogs, setDailyLogs] = useState({});
  const chartRef = useRef(null);

  // Fetch Logs
  const fetchLogs = async () => {
    try {
      const startOfWeek = dayjs().startOf("week").format("YYYY-MM-DD");
      const endOfWeek = dayjs().endOf("week").format("YYYY-MM-DD");

      const { data, error } = await supabase
        .from("daily_logs")
        .select("date, hours_logged")
        .gte("date", startOfWeek)
        .lte("date", endOfWeek);

      if (error) throw error;

      const logs = data.reduce((acc, log) => {
        const dayName = dayjs(log.date).format("dddd");
        acc[dayName] = log.hours_logged;
        return acc;
      }, {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      });

      setDailyLogs(logs);
    } catch (err) {
      console.error("Error fetching logs:", err.message);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Render Chart
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      if (window.myChart) window.myChart.destroy();

      window.myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          datasets: [
            {
              label: "Hours Logged",
              data: [
                dailyLogs.Sunday,
                dailyLogs.Monday,
                dailyLogs.Tuesday,
                dailyLogs.Wednesday,
                dailyLogs.Thursday,
                dailyLogs.Friday,
                dailyLogs.Saturday,
              ],
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  }, [dailyLogs]);

  return (
    <div>
      <h2>Progress Overview</h2>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ProgressOverview;
