import { useEffect, useState } from "react";
import api from "../api/axios";

interface RankInfo {
  rank: number;
  final_score: number;
}

interface RankResponse {
  student_id: string;
  ranks: {
    [subjectCode: string]: RankInfo;
  };
}

const RankBadge = () => {
  const [data, setData] = useState<RankResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRank = async () => {
      try {
        const res = await api.get("/student/rank");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load rank", err);
      } finally {
        setLoading(false);
      }
    };

    loadRank();
  }, []);

  if (loading) return <p>Loading rank...</p>;
  if (!data || !data.ranks || Object.keys(data.ranks).length === 0) {
    return <p>No rank data available</p>;
  }

  return (
    <div className="rank-box">
      <h3 className="rank-title">Your Rank</h3>

      <div className="rank-list">
        {Object.entries(data.ranks).map(([subject, info]) => (
          <div key={subject} className="rank-subject-card">
            <div className="rank-subject-name">{subject}</div>

            <div className="rank-main">
              <span className="rank-number">#{info.rank}</span>
              <span className="rank-score">
                {info.final_score} / 60
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankBadge;