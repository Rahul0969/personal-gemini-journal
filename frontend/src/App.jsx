import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { analyzeJournal } from "./gemini";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [entry, setEntry] = useState("");
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        loadJournals(currentUser.uid);
      } else {
        setJournals([]);
      }
    });

    return unsubscribe;
  }, []);

  async function loadJournals(uid) {
    try {
      const journalsRef = collection(db, "users", uid, "journals");
      const q = query(journalsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      setJournals(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveJournal() {
    if (!entry.trim() || !user) return;

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "users", user.uid, "journals"), {
        text: entry.trim(),
        analysis: analysis || null,
        createdAt: serverTimestamp(),
      });

      setEntry("");
      setAnalysis(null);
      await loadJournals(user.uid);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteJournal(id) {
    try {
      await deleteDoc(doc(db, "users", user.uid, "journals", id));
      await loadJournals(user.uid);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAnalyze() {
    if (!entry.trim()) return;

    setAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await analyzeJournal(entry.trim());

      const cleaned = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      setAnalysis(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  const analyzedJournals = journals.filter(
    (journal) => journal.analysis?.moodScore
  );

  const averageMood =
    analyzedJournals.length > 0
      ? (
          analyzedJournals.reduce(
            (sum, journal) => sum + Number(journal.analysis.moodScore),
            0
          ) / analyzedJournals.length
        ).toFixed(1)
      : "—";

  const latestMood =
    journals.find((journal) => journal.analysis?.mood)?.analysis?.mood || "—";

  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="brand-mark">✦</div>

          <h1>Personal Gemini Journal</h1>

          <p>Reflect. Understand. Grow.</p>

          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          {error && <div className="error">{error}</div>}

          <button
            className="switch-button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
          >
            {mode === "login"
              ? "Create a new account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <header className="topbar">
        <div>
          <div className="brand-title">Personal Gemini Journal</div>

          <div className="brand-subtitle">
            Your private space for reflection
          </div>
        </div>

        <button className="logout-button" onClick={() => signOut(auth)}>
          Sign out
        </button>
      </header>

      <section className="hero">
        <div>
          <span className="eyebrow">PERSONAL REFLECTION</span>

          <h1>How are you feeling today?</h1>

          <p>
            Write freely. Gemini will help you discover patterns and insights.
          </p>
        </div>
      </section>

      <section className="journal-layout">
        <div className="editor-card">
          <div className="card-header">
            <div>
              <h2>Today's reflection</h2>

              <span>{entry.length} characters</span>
            </div>
          </div>

          <textarea
            value={entry}
            onChange={(e) => {
              setEntry(e.target.value);
              setAnalysis(null);
            }}
            placeholder="What's on your mind?"
          />

          <div className="editor-actions">
            <button
              className="secondary-button"
              onClick={handleAnalyze}
              disabled={!entry.trim() || analyzing}
            >
              {analyzing ? "Analyzing..." : "✦ Analyze My Journal"}
            </button>

            <button
              className="primary-button"
              onClick={saveJournal}
              disabled={!entry.trim() || loading}
            >
              {loading ? "Saving..." : "Save Reflection"}
            </button>
          </div>
        </div>

        {analysis && (
          <div className="analysis-card">
            <div className="card-header">
              <div>
                <span className="eyebrow">GEMINI INSIGHT</span>

                <h2>Your reflection</h2>
              </div>
            </div>

            <div className="mood-overview">
              <div className="mood-box">
                <span>MOOD</span>

                <strong>{analysis.mood}</strong>
              </div>

              <div className="mood-box">
                <span>MOOD SCORE</span>

                <strong>{analysis.moodScore}/10</strong>
              </div>
            </div>

            <div className="analysis-grid">
              <div className="analysis-item">
                <span>EMOTIONS</span>

                <p>
                  {Array.isArray(analysis.emotions)
                    ? analysis.emotions.join(" • ")
                    : analysis.emotions}
                </p>
              </div>

              <div className="analysis-item">
                <span>KEY THEMES</span>

                <p>
                  {Array.isArray(analysis.keyThemes)
                    ? analysis.keyThemes.join(" • ")
                    : analysis.keyThemes}
                </p>
              </div>

              <div className="analysis-item">
                <span>SUMMARY</span>

                <p>{analysis.summary}</p>
              </div>

              <div className="analysis-item">
                <span>REFLECTION</span>

                <p>{analysis.reflection}</p>
              </div>

              <div className="analysis-item">
                <span>HELPFUL INSIGHT</span>

                <p>{analysis.helpfulInsight}</p>
              </div>

              <div className="analysis-item">
                <span>SUGGESTED ACTION</span>

                <p>{analysis.suggestedAction}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {error && <div className="error dashboard-error">{error}</div>}

      <section className="insights-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">GEMINI ANALYTICS</span>

            <h2>Your reflection patterns</h2>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>TOTAL ENTRIES</span>

            <strong>{journals.length}</strong>
          </div>

          <div className="stat-card">
            <span>AVERAGE MOOD</span>

            <strong>
              {averageMood}
              {averageMood !== "—" && "/10"}
            </strong>
          </div>

          <div className="stat-card">
            <span>LATEST MOOD</span>

            <strong>{latestMood}</strong>
          </div>
        </div>

        {analyzedJournals.length > 0 && (
          <div className="mood-trend-card">
            <div className="trend-header">
              <div>
                <span className="eyebrow">MOOD TREND</span>

                <h3>Your recent mood scores</h3>
              </div>
            </div>

            <div className="mood-bars">
              {analyzedJournals
                .slice(0, 7)
                .reverse()
                .map((journal) => (
                  <div className="mood-bar-item" key={journal.id}>
                    <div className="mood-bar-value">
                      {journal.analysis.moodScore}
                    </div>

                    <div className="mood-bar-track">
                      <div
                        className="mood-bar-fill"
                        style={{
                          height: `${Number(journal.analysis.moodScore) * 10}%`,
                        }}
                      />
                    </div>

                    <span>
                      {journal.createdAt?.toDate
                        ? journal.createdAt.toDate().toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })
                        : "Now"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      <section className="past-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR JOURNAL</span>

            <h2>Past reflections</h2>
          </div>

          <span className="journal-count">
            {journals.length}{" "}
            {journals.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {journals.length === 0 ? (
          <div className="empty-state">
            <div>✦</div>

            <h3>No reflections yet</h3>

            <p>Your saved journal entries will appear here.</p>
          </div>
        ) : (
          <div className="journal-grid">
            {journals.map((journal) => (
              <article className="journal-card" key={journal.id}>
                <div className="journal-date">
                  {journal.createdAt?.toDate
                    ? journal.createdAt.toDate().toLocaleString()
                    : "Just now"}
                </div>

                <p>{journal.text}</p>

                {journal.analysis && (
                  <div className="saved-insight">
                    <strong>{journal.analysis.mood}</strong>

                    <span>
                      Mood {journal.analysis.moodScore}/10
                    </span>
                  </div>
                )}

                <button
                  className="delete-button"
                  onClick={() => deleteJournal(journal.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;