import { useEffect, useState } from "react";
import api from "../api/axios";
import MarksEntry from "../components/MarksEntry";
import StudentsTable from "../components/StudentsTable";
import LogoutButton from "../components/LogoutButton";
import PerformanceChart from "../components/PerformanceChart";
import RankingTable from "../components/RankingTable";
import TopKTable from "../components/TopKTable";

const FacultyDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartScores, setChartScores] = useState<number[]>([]);
  const [subjectName, setSubjectName] = useState<string>("");

  /* 🔄 Trigger refresh after add / update / delete */
  const refreshStudents = () => {
    setRefreshKey((prev) => prev + 1);
  };

  /* 📊 Load chart data (subject-filtered from backend) */
  const loadChartData = async () => {
    try {
      const res = await api.get("/faculty/students");
      setChartLabels(res.data.map((s: any) => s.student_id));
      setChartScores(res.data.map((s: any) => s.final_score));
    } catch (err) {
      console.error("Failed to load chart data", err);
    }
  };

  /* 🔐 Load logged-in faculty subject */
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setSubjectName(res.data?.subject_name || "");
      })
      .catch((err) => {
        console.error("auth/me failed", err);
      });
  }, []);

  /* 🔁 Reload chart whenever data changes */
  useEffect(() => {
    loadChartData();
  }, [refreshKey]);

  return (
    <div style={{ padding: "24px" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1>
          Faculty Dashboard
          {subjectName ? ` – ${subjectName}` : ""}
        </h1>
        <LogoutButton />
      </div>

      {/* MARKS ENTRY + PERFORMANCE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* LEFT */}
        <section className="card">
          <MarksEntry onSuccess={refreshStudents} />
        </section>

        {/* RIGHT */}
        <section className="card">
          <h2>Class Performance</h2>
          <PerformanceChart
            labels={chartLabels}
            scores={chartScores}
          />
        </section>
      </div>

      {/* STUDENTS TABLE */}
      <section className="card">
        <StudentsTable
          refreshKey={refreshKey}
          onChange={refreshStudents}
        />
      </section>

      <hr />

      {/* RANKING */}
      <section className="card">
        <RankingTable refreshKey={refreshKey} />
      </section>

      <hr />

      {/* TOP-K */}
      <section className="card">
        <TopKTable />
      </section>

      
    </div>
  );
};

export default FacultyDashboard;