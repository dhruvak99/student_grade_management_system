// import { useEffect, useState } from "react";
// import api from "../api/axios";
// // import ReactMarkdown from "react-markdown";

// const AISummaryCard = () => {
//   const [summary, setSummary] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.get("/student/ai-summary")
//       .then((res) => {
//         setSummary(res.data.ai_summary);
//       })
//       .catch(() => {
//         setSummary("AI feedback unavailable.");
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   return (
//     <div>
//       <h2>AI Performance Feedback</h2>

//       {loading ? (
//         <p>Analyzing performance...</p>
//       ) : (
//         <p style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
//           {summary}
//         </p>
//       )}
//     </div>
//   );
// };

// export default AISummaryCard;

import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";

const AISummaryCard = () => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔒 prevents double API calls in React 18 StrictMode
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    api
      .get("/student/ai-summary")
      .then((res) => {
        let text = res.data.ai_summary || "";

        // 🧹 remove "(118 words)" or similar
        text = text.replace(/\(\d+\s*words?\)/gi, "").trim();

        setSummary(text);
      })
      .catch(() => {
        setSummary("AI feedback unavailable.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>AI Performance Feedback</h2>

      {loading ? (
        <p>Analyzing performance...</p>
      ) : (
        <div className="ai-summary">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default AISummaryCard;
//newcode