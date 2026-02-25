import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
);

interface Props {
  labels: string[];
  scores: number[];
}

const PerformanceChart = ({ labels, scores }: Props) => {
  if (!labels.length || !scores.length) {
    return <p style={{ opacity: 0.6 }}>No data to display</p>;
  }

  return (
    <div style={{ height: "320px" }}> {/* 🔑 CRITICAL FIX */}
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Final Score",
              data: scores,
              backgroundColor: scores.map((s) =>
                s < 40 ? "#dc2626" : "#2563eb"
              ),
              borderRadius: 6,
              barThickness: 34,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false, // 🔑 REQUIRED
          animation: {
            duration: 600,
            easing: "easeOutQuart",
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Score: ${ctx.raw} / 60`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              max: 60,
              ticks: { stepSize: 10 },
              grid: { color: "#e5e7eb" },
            },
          },
        }}
      />
    </div>
  );
};

export default PerformanceChart;