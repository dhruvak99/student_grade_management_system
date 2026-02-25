import { useState } from "react";
import api from "../api/axios";

interface Student {
  student_id: string;
  final_score: number;
}

const TopKTable = () => {
  const [k, setK] = useState(3);
  const [students, setStudents] = useState<Student[]>([]);

  const loadTopK = async () => {
    const res = await api.get(`/faculty/top/${k}`);
    setStudents(res.data);
  };

  return (
    <div>
      <h2>Top Performers</h2>

      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <input
          type="number"
          min={1}
          value={k}
          onChange={(e) => setK(Number(e.target.value))}
        />
        <button onClick={loadTopK}>Load Top-K</button>
      </div>

      {students.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student ID</th>
              <th>Final Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.student_id}>
                <td>{i + 1}</td>
                <td>{s.student_id}</td>
                <td>{s.final_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TopKTable;