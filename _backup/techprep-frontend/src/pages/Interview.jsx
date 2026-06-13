import { useState } from "react";
import axios from "axios";

export default function Interview() {
  const [topic, setTopic] = useState("DSA");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  const getQuestion = async () => {
    const res = await axios.get(`http://localhost:8000/interview/question?topic=${topic}`);
    setQuestion(res.data.question);
    setFeedback(null);
  };

  const submitAnswer = async () => {
    const res = await axios.post("http://localhost:8000/interview/evaluate", {
      question, answer
    });
    setFeedback(res.data.result);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🎤 Mock Interview</h1>

      {/* Topic Selector */}
      <select onChange={(e) => setTopic(e.target.value)}
        className="border p-2 rounded mb-4 w-full">
        <option>DSA</option>
        <option>Machine Learning</option>
        <option>Python</option>
        <option>HR / Behavioural</option>
      </select>

      <button onClick={getQuestion}
        className="bg-blue-600 text-white px-6 py-2 rounded mb-6">
        Get Question
      </button>

      {question && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p className="font-semibold">{question}</p>
        </div>
      )}

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full border p-3 rounded h-32 mb-4"
      />

      <button onClick={submitAnswer}
        className="bg-green-600 text-white px-6 py-2 rounded">
        Submit Answer
      </button>

      {feedback && (
        <div className="mt-6 bg-white border rounded p-4">
          <h2 className="text-xl font-bold">📊 AI Feedback</h2>
          <p><strong>Score:</strong> {feedback.score}/10</p>
          <p><strong>Feedback:</strong> {feedback.feedback}</p>
          <p><strong>Improvements:</strong> {feedback.improvements}</p>
        </div>
      )}
    </div>
  );
}