import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, startOfWeek, eachDayOfInterval, addDays } from 'date-fns';

// Register Chart.js components and scales
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProgressOverview = () => {
  const timeLogs = [
    { date: '2025-01-12', hours: 3 },
    { date: '2025-01-13', hours: 2 },
    { date: '2025-01-14', hours: 4 },
    { date: '2025-01-15', hours: 6 },
    { date: '2025-01-16', hours: 5 },
  ];

  // Generate this week's dates (start from Sunday)
  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 }); // Set start of the week to Sunday
  const weekDates = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 6), // Add 6 days to get the full week
  });

  // Fix: Ensure consistent formatting for all dates
  const timeByDay = weekDates.map((date) => {
    const dateString = format(date, 'yyyy-MM-dd'); // Format the date for comparison
    const totalHours = timeLogs
      .filter((log) => log.date === dateString) // Compare formatted dates
      .reduce((sum, log) => sum + log.hours, 0); // Sum hours for the day
    return { day: format(date, 'EEE'), hours: totalHours };
  });

  // Debugging Output
  useEffect(() => {
    console.log('Week Dates:', weekDates.map((d) => format(d, 'yyyy-MM-dd')));
    console.log('Time by Day:', timeByDay);
  }, [timeByDay]);

  const chartData = {
    labels: timeByDay.map((entry) => entry.day), // Labels are the days of the week
    datasets: [
      {
        label: 'Hours Logged',
        data: timeByDay.map((entry) => entry.hours), // Data is the total hours for each day
        backgroundColor: 'rgba(75, 192, 192, 0.4)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Weekly Progress Overview' },
    },
    scales: {
      x: {
        title: { display: true, text: 'Days' },
      },
      y: {
        title: { display: true, text: 'Hours' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h2>Progress Overview</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ProgressOverview;
