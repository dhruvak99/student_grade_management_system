import { useEffect, useState } from "react";
import api from "../api/axios";

interface RankItem {
  student_id: string;
  final_score: number;
}

const RankingTable = ({ refreshKey }: { refreshKey: number }) => {
  const [ranking, setRanking] = useState<RankItem[]>([]);

  useEffect(() => {
    api.get("/faculty/ranking").then((res) => {
      setRanking(res.data);
    });
  }, [refreshKey]);

  return (
    <div>
      <h2>Class Ranking</h2>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student ID</th>
            <th>Final Score</th>
          </tr>
        </thead>

        <tbody>
          {ranking.map((r, index) => (
            <tr key={r.student_id}>
              <td>{index + 1}</td>
              <td>{r.student_id}</td>
              <td>
                <strong>{r.final_score}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;