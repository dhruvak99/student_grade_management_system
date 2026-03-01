import { useEffect, useState } from "react";
import api from "../api/axios";
import LogoutButton from "../components/LogoutButton";

type User = {
  id: number;
  username: string;
  role: "admin" | "faculty" | "student";
  subject: string | null;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  /* 🔄 Load users */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ➕ Create faculty */
  const createFaculty = async () => {
    setMessage("");

    if (!subjectName || !subjectCode || !username || !password) {
      setMessage("All fields are required");
      return;
    }

    try {
      await api.post("/admin/faculty", {
        subject_name: subjectName.trim(),
        subject_code: subjectCode.trim().toUpperCase(),
        username: username.trim(),
        password,
      });

      setMessage("Faculty created successfully ✅");

      setSubjectName("");
      setSubjectCode("");
      setUsername("");
      setPassword("");

      loadUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Error creating faculty");
    }
  };

  /* ❌ Delete faculty */
  const deleteFaculty = async (id: number) => {
    const ok = window.confirm("Delete this faculty?");
    if (!ok) return;

    try {
      await api.delete(`/admin/faculty/${id}`);
      setMessage("Faculty deleted successfully ✅");
      loadUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Error deleting faculty");
    }
  };

  /* 🔍 Filter users */
  const facultyUsers = users.filter((u) => u.role === "faculty");
  const studentUsers = users.filter((u) => u.role === "student");

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
        <h1>Admin Dashboard</h1>
        <LogoutButton />
      </div>

      {/* ADD FACULTY */}
      <section className="card" style={{ marginBottom: "32px" }}>
        <h2>Add Faculty</h2>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            placeholder="Subject Name (e.g. Mathematics)"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
          <input
            placeholder="Subject Code (e.g. MATHS)"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
          />
          <input
            placeholder="Faculty Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="Faculty Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={createFaculty} disabled={loading}>
            Create Faculty
          </button>
        </div>

        {message && <p style={{ marginTop: "12px" }}>{message}</p>}
      </section>

      {/* FACULTY MANAGEMENT */}
      <section className="card" style={{ marginBottom: "32px" }}>
        <h2>Faculty Management</h2>

        {loading ? (
          <p>Loading faculty...</p>
        ) : facultyUsers.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No faculty added yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Subject Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {facultyUsers.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.username}</td>
                  <td>{f.subject}</td>
                  <td>
                    <button
                      style={{ background: "#dc2626" }}
                      onClick={() => deleteFaculty(f.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* STUDENTS OVERVIEW */}
      <section className="card">
        <h2>Students Overview</h2>

        {loading ? (
          <p>Loading students...</p>
        ) : studentUsers.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No students yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student ID</th>
              </tr>
            </thead>
            <tbody>
              {studentUsers.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}