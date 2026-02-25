import { useEffect, useState } from "react";
import api from "../api/axios";

interface RankInfo {
  rank: number;
  final_score: number;
}

interface RankResponse {
  student_id: string;
  ranks: {
    [subject: string]: RankInfo;
  };
}

const SUBJECT_LABELS: Record<string, string> = {
  DSA: "Data Structures & Algorithms",
  AIML: "Artificial Intelligence & ML",
};

const RankBadge = () => {
  const [data, setData] = useState<RankResponse | null>(null);

  useEffect(() => {
    api.get("/student/rank").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) return <p>Loading rank...</p>;

  return (
    <div className="rank-box">
      <h3 className="rank-title">Your Rank</h3>

      {Object.entries(data.ranks).map(([subject, info]) => (
        <div key={subject} className="rank-subject-card">
          <div className="rank-subject-name">
            {SUBJECT_LABELS[subject] || subject}
          </div>

          <div className="rank-main">
            <span className="rank-number">#{info.rank}</span>
            <span className="rank-score">{info.final_score} / 60</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RankBadge;