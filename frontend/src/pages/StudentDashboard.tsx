import { useEffect, useState } from "react";
import api from "../api/axios";
import LogoutButton from "../components/LogoutButton";
import StudentPerformanceChart from "../components/StudentPerformanceChart";
import AISummaryCard from "../components/AISummaryCard";
import RankBadge from "../components/RankBadge";

/* 🎨 Dynamic color generator (no hard limit) */
const generateColor = (index: number) => {
  const palette = [
    "#22c55e", // green
    "#3b82f6", // blue
    "#f97316", // orange
    "#a855f7", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#eab308", // yellow
  ];
  return palette[index % palette.length];
};

const StudentDashboard = () => {
  const [studentId, setStudentId] = useState("");
  const [subjects, setSubjects] = useState<Record<string, any>>({});

  useEffect(() => {
    api.get("/student/me").then((res) => {
      setStudentId(res.data.student_id);
      setSubjects(res.data.subjects || {});
    });
  }, []);

  const subjectCodes = Object.keys(subjects);

  /* 📊 Build datasets dynamically */
  const internalDatasets = subjectCodes.map((code, index) => ({
    label: code, // subject code from DB (e.g. MATHS, DSA)
    data: subjects[code]?.internals || [],
    color: generateColor(index),
  }));

  const quizDatasets = subjectCodes.map((code, index) => ({
    label: code,
    data: subjects[code]?.quizzes || [],
    color: generateColor(index),
  }));

  return (
    <div className="student-dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Student Dashboard - {studentId}</h1>
        <LogoutButton />
      </div>

      {/* FIRST ROW */}
      <div className="student-row-1">

        {/* RANK CARD */}
        <section className="card rank-box">
          <RankBadge />
        </section>

        {/* INTERNALS GRAPH */}
        <section className="card">
          <h3>Internals</h3>
          <div className="chart-container">
            <StudentPerformanceChart
              labels={["Internal 1", "Internal 2", "Internal 3"]}
              maxY={50}
              datasets={internalDatasets}
            />
          </div>
        </section>

        {/* QUIZZES GRAPH */}
        <section className="card">
          <h3>Quizzes</h3>
          <div className="chart-container">
            <StudentPerformanceChart
              labels={["Quiz 1", "Quiz 2", "Quiz 3"]}
              maxY={10}
              datasets={quizDatasets}
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