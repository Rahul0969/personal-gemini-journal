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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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

  if (!user) {
    return (
      <div>
        <h1>Personal Gemini Journal</h1>

        <h2>{isLogin ? "Login" : "Create Account"}</h2>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <br />
          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <br />
          <br />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        {error && <p>{error}</p>}

        <br />

        <button
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
    );
  }

  return (
    <div>
      <h1>Personal Gemini Journal</h1>

      <p>
        Logged in as: <strong>{user.email}</strong>
      </p>

      <button onClick={handleLogout}>Logout</button>

      <hr />

      <h2>Write a Journal Entry</h2>

      <form onSubmit={saveJournal}>
        <input
          type="text"
          placeholder="Journal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <br />
        <br />

        <textarea
          placeholder="Write about your day..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="10"
          cols="50"
          required
        />

        <br />
        <br />

        <button type="submit">Save Journal</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <hr />

      <h2>My Journal Entries</h2>

      {loadingJournals ? (
        <p>Loading journals...</p>
      ) : journals.length === 0 ? (
        <p>No journal entries yet.</p>
      ) : (
        journals.map((journal) => (
          <div key={journal.id}>
            <h3>{journal.title}</h3>
            <p>{journal.content}</p>

            <button onClick={() => deleteJournal(journal.id)}>
              Delete
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default App;