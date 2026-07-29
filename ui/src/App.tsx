import { useState, useEffect } from "react";

interface Feedback {
  id: number;
  text: string;
}

function App() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [credential, setCredential] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Not connected");
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1> whistleblower</h1>
      <p>Anonymous, verifiable feedback on the Midnight Network</p>

      <section style={{ marginBottom: "20px", padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2>Status</h2>
        <p>{status}</p>
      </section>

      <section style={{ marginBottom: "20px", padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2>Submit Feedback</h2>
        <div style={{ marginBottom: "8px" }}>
          <label htmlFor="credential">Credential (decimal): </label>
          <input
            id="credential"
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>
        <div style={{ marginBottom: "8px" }}>
          <label htmlFor="feedback">Feedback: </label>
          <input
            id="feedback"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: "400px" }}
          />
        </div>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              setStatus("Submitting proof...");
              await new Promise((resolve) => setTimeout(resolve, 2000));
              setFeedbacks((prev) => [...prev, { id: prev.length + 1, text: message }]);
              setMessage("");
              setStatus("Feedback submitted!");
            } catch (e) {
              setStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || !credential || !message}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </section>

      <section style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2>Public Feed ({feedbacks.length} items)</h2>
        {feedbacks.length === 0 ? (
          <p>No feedback yet.</p>
        ) : (
          <ul>
            {feedbacks.map((fb) => (
              <li key={fb.id}>{fb.text}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;