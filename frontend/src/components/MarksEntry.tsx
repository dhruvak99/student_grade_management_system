import { useState } from "react";
import api from "../api/axios";

const MarksEntry = ({ onSuccess }: { onSuccess: () => void }) => {
  const [studentId, setStudentId] = useState("");
  const [internals, setInternals] = useState<number[]>([0, 0, 0]);
  const [quizzes, setQuizzes] = useState<number[]>([0, 0, 0]);
  const [message, setMessage] = useState("");

  /* ---------- VALIDATION ---------- */
  const validateMarks = () => {
    if (!studentId.trim()) {
      return "Student ID is required";
    }

    for (let i = 0; i < internals.length; i++) {
      if (internals[i] < 0 || internals[i] > 50) {
        return `Internal ${i + 1} must be between 0 and 50`;
      }
    }

    for (let i = 0; i < quizzes.length; i++) {
      if (quizzes[i] < 0 || quizzes[i] > 10) {
        return `Quiz ${i + 1} must be between 0 and 10`;
      }
    }

    return null;
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    const error = validateMarks();
    if (error) {
      setMessage(error);
      return;
    }

    try {
      await api.post("/faculty/marks", {
        student_id: studentId.trim().toUpperCase(),
        internals,
        quizzes,
      });

      setMessage("Marks saved successfully ✅");
      setStudentId("");
      setInternals([0, 0, 0]);
      setQuizzes([0, 0, 0]);
      onSuccess();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Error saving marks");
    }
  };

  return (
    <div className="card">
      <h2>Marks Entry</h2>

      <input
        placeholder="Student ID (e.g. S001)"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />

      <h4>Internals (0 – 50)</h4>
      {internals.map((val, i) => (
        <input
          key={i}
          type="number"
          value={val}
          onChange={(e) => {
            const copy = [...internals];
            copy[i] = Number(e.target.value);
            setInternals(copy);
          }}
        />
      ))}

      <h4>Quizzes (0 – 10)</h4>
      {quizzes.map((val, i) => (
        <input
          key={i}
          type="number"
          value={val}
          onChange={(e) => {
            const copy = [...quizzes];
            copy[i] = Number(e.target.value);
            setQuizzes(copy);
          }}
        />
      ))}

      <button onClick={handleSubmit}>Save Marks</button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default MarksEntry;