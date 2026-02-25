import { useEffect, useState } from "react";
import api from "../api/axios";
import LogoutButton from "../components/LogoutButton";
import StudentPerformanceChart from "../components/StudentPerformanceChart";
import AISummaryCard from "../components/AISummaryCard";
import RankBadge from "../components/RankBadge";

const StudentDashboard = () => {
  const [studentId, setStudentId] = useState("");
  const [subjects, setSubjects] = useState<any>({});

  useEffect(() => {
    api.get("/student/me").then((res) => {
      setStudentId(res.data.student_id);
      setSubjects(res.data.subjects);
    });
  }, []);

  // 🔍 TEMP DEBUG — remove later
  console.log("STUDENT SUBJECTS:", subjects);

  return (
    <div className="student-dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Student Dashboard - {studentId}</h1>
        <LogoutButton />
      </div>

      {/* FIRST ROW */}
      <div className="student-row-1">

        {/* RANK */}
        <section className="card rank-box">
          <RankBadge />
        </section>

        {/* INTERNALS — TEMP: using DSA only for now */}
        <section className="card">
          <h3>Internals</h3>
          <div className="chart-container">
            <StudentPerformanceChart
  labels={["Internal 1", "Internal 2", "Internal 3"]}
  maxY={50}
  datasets={[
    {
      label: "DSA",
      data: subjects?.DSA?.internals || [],
      color: "#22c55e", // green
    },
    {
      label: "AIML",
      data: subjects?.AIML?.internals || [],
      color: "#3b82f6", // blue
    },
  ]}
/>
          </div>
        </section>

        {/* QUIZZES — TEMP: using DSA only for now */}
        <section className="card">
          <h3>Quizzes</h3>
          <div className="chart-container">
            <StudentPerformanceChart
  labels={["Quiz 1", "Quiz 2", "Quiz 3"]}
  maxY={10}
  datasets={[
    {
      label: "DSA",
      data: subjects?.DSA?.quizzes || [],
      color: "#22c55e",
    },
    {
      label: "AIML",
      data: subjects?.AIML?.quizzes || [],
      color: "#3b82f6",
    },
  ]}
/>
          </div>
        </section>

      </div>

      {/* SECOND ROW */}
      <div className="student-row-2">
        <section className="card">
          <AISummaryCard />
        </section>
      </div>

    </div>
  );
};

export default StudentDashboard;