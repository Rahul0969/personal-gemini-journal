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
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [journals, setJournals] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        loadJournals(currentUser);
      } else {
        setJournals([]);
      }
    });

    return unsubscribe;
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadJournals = async (currentUser) => {
    setLoadingJournals(true);
    setError("");

    try {
      const journalsRef = collection(
        db,
        "users",
        currentUser.uid,
        "journals"
      );

      const journalsQuery = query(
        journalsRef,
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(journalsQuery);

      const entries = snapshot.docs.map((journal) => ({
        id: journal.id,
        ...journal.data(),
      }));

      setJournals(entries);
    } catch (err) {
      setError("Unable to load journals: " + err.message);
    } finally {
      setLoadingJournals(false);
    }
  };

  const saveJournal = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please login first.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Please enter both title and content.");
      return;
    }

    setError("");
    setMessage("");

    try {
      const journalsRef = collection(
        db,
        "users",
        user.uid,
        "journals"
      );

      await addDoc(journalsRef, {
        title: title.trim(),
        content: content.trim(),
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setContent("");
      setMessage("Journal saved successfully!");

      await loadJournals(user);
    } catch (err) {
      setError("Unable to save journal: " + err.message);
    }
  };

  const deleteJournal = async (journalId) => {
    if (!user) return;

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "journals", journalId)
      );

      setJournals((current) =>
        current.filter((journal) => journal.id !== journalId)
      );

      setMessage("Journal deleted.");
    } catch (err) {
      setError("Unable to delete journal: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setTitle("");
    setContent("");
    setJournals([]);
    setMessage("");
    setError("");
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Just now";

    return timestamp.toDate().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="logo">✦</div>

          <h1>Personal Gemini Journal</h1>

          <p className="subtitle">
            Your private space for thoughts, memories and reflections.
          </p>

          <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>

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

            <button className="primary-button" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}

          <button
            className="switch-button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <div className="brand">
            <span>✦</span>
            Personal Gemini Journal
          </div>

          <p className="welcome">
            A private space for your thoughts.
          </p>
        </div>

        <div className="user-area">
          <span>{user.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="dashboard">
        <div className="editor-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NEW ENTRY</span>
              <h2>What’s on your mind?</h2>
            </div>

            <span className="spark">✦</span>
          </div>

          <form onSubmit={saveJournal}>
            <input
              className="title-input"
              type="text"
              placeholder="Give your entry a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Write freely. This is your private space..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="10"
              required
            />

            <div className="editor-footer">
              <span>{content.length} characters</span>

              <button className="primary-button" type="submit">
                Save Entry
              </button>
            </div>
          </form>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </div>

        <section className="journal-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR JOURNAL</span>
              <h2>Past reflections</h2>
            </div>

            <span className="count">{journals.length}</span>
          </div>

          {loadingJournals ? (
            <div className="empty-card">
              <p>Loading your journal...</p>
            </div>
          ) : journals.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">✦</div>
              <h3>Your journal starts here</h3>
              <p>
                Write your first entry above and begin building your personal
                timeline.
              </p>
            </div>
          ) : (
            <div className="journal-grid">
              {journals.map((journal) => (
                <article className="journal-card" key={journal.id}>
                  <div className="journal-card-top">
                    <span className="date">
                      {formatDate(journal.createdAt)}
                    </span>

                    <button
                      className="delete-button"
                      onClick={() => deleteJournal(journal.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <h3>{journal.title}</h3>

                  <p>{journal.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;