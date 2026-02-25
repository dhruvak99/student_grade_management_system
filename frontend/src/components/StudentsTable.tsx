import { useEffect, useState } from "react";
import api from "../api/axios";

interface Student {
  student_id: string;
  internals: number[];
  quizzes: number[];
  best_internals: number[];
  best_quizzes: number[];
  final_score: number;
}

const StudentsTable = ({
  refreshKey,
  onChange,
}: {
  refreshKey: number;
  onChange: () => void;
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    student_id: string;
    internals: number[];
    quizzes: number[];
  } | null>(null);
  const [error, setError] = useState<string>("");

  const loadStudents = async () => {
    const res = await api.get("/faculty/students");
    setStudents(res.data);
  };

  useEffect(() => {
    loadStudents();
  }, [refreshKey]);

  /* ---------- VALIDATION ---------- */

  const validateEdit = () => {
    if (!editData) return "Invalid edit data";

    for (let i = 0; i < editData.internals.length; i++) {
      if (editData.internals[i] < 0 || editData.internals[i] > 50) {
        return `Internal ${i + 1} must be between 0 and 50`;
      }
    }

    for (let i = 0; i < editData.quizzes.length; i++) {
      if (editData.quizzes[i] < 0 || editData.quizzes[i] > 10) {
        return `Quiz ${i + 1} must be between 0 and 10`;
      }
    }

    return null;
  };

  /* ---------- EDIT ---------- */

  const startEdit = (s: Student) => {
    setEditingId(s.student_id);
    setEditData({
      student_id: s.student_id,
      internals: [...s.internals],
      quizzes: [...s.quizzes],
    });
    setError("");
  };

  const updateInternal = (i: number, value: number) => {
    if (!editData) return;
    const copy = [...editData.internals];
    copy[i] = value;
    setEditData({ ...editData, internals: copy });
  };

  const updateQuiz = (i: number, value: number) => {
    if (!editData) return;
    const copy = [...editData.quizzes];
    copy[i] = value;
    setEditData({ ...editData, quizzes: copy });
  };

  const saveEdit = async () => {
    if (!editData) return;

    const validationError = validateEdit();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await api.post("/faculty/marks", editData);
      setEditingId(null);
      setEditData(null);
      setError("");
      onChange(); // 🔥 refresh table + chart
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error updating marks");
    }
  };

  /* ---------- DELETE ---------- */

  const deleteStudent = async (studentId: string) => {
    const ok = window.confirm(`Delete marks for ${studentId}?`);
    if (!ok) return;

    await api.delete(`/faculty/marks/${studentId}`);
    onChange();
  };

  return (
    <div>
      <h2>All Students</h2>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>I1</th><th>I2</th><th>I3</th>
            <th>Q1</th><th>Q2</th><th>Q3</th>
            <th>Best Internals</th>
            <th>Best Quizzes</th>
            <th>Final</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.student_id}>
              <td>{s.student_id}</td>

              {s.internals.map((m, i) => (
                <td key={i}>
                  {editingId === s.student_id && editData ? (
                    <input
                      type="number"
                      value={editData.internals[i]}
                      onChange={(e) =>
                        updateInternal(i, Number(e.target.value))
                      }
                    />
                  ) : (
                    m
                  )}
                </td>
              ))}

              {s.quizzes.map((m, i) => (
                <td key={i}>
                  {editingId === s.student_id && editData ? (
                    <input
                      type="number"
                      value={editData.quizzes[i]}
                      onChange={(e) =>
                        updateQuiz(i, Number(e.target.value))
                      }
                    />
                  ) : (
                    m
                  )}
                </td>
              ))}

              <td>{s.best_internals.join(", ")}</td>
              <td>{s.best_quizzes.join(", ")}</td>
              <td><strong>{s.final_score}</strong></td>

              <td>
                {editingId === s.student_id ? (
                  <>
                    <button onClick={saveEdit}>💾</button>
                    <button
                      style={{ marginLeft: 6 }}
                      onClick={() => {
                        setEditingId(null);
                        setEditData(null);
                        setError("");
                      }}
                    >
                      ✖
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(s)}>✏️</button>
                    <button
                      style={{ marginLeft: 6, background: "#dc2626" }}
                      onClick={() => deleteStudent(s.student_id)}
                    >
                      🗑
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTable;