import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface Props {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
  maxY: number;
}

const StudentPerformanceChart = ({ labels, datasets, maxY }: Props) => {
  if (!datasets.length) return <p>No data available</p>;

  return (
    <Line
      data={{
        labels,
        datasets: datasets.map((d) => ({
          label: d.label,
          data: d.data,
          borderColor: d.color,
          backgroundColor: d.color,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#e5e7eb",
              boxWidth: 16,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: maxY,
            ticks: {
              stepSize: maxY === 50 ? 10 : 2,
              color: "#9ca3af",
            },
            grid: {
              color: "#232834",
            },
          },
          x: {
            ticks: {
              color: "#9ca3af",
            },
            grid: {
              display: false,
            },
          },
        },
      }}
    />
  );
};

export default StudentPerformanceChart;