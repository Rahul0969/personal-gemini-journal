import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login / Signup
  const handleAuth = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      setUser(result.user);
    } catch (err) {
      console.error(err);

      // Friendly error messages
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

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setEmail("");
      setPassword("");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Firestore test
  const testFirestore = async () => {
    setError("");

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("Please login first.");
        return;
      }

      await addDoc(collection(db, "journals"), {
        userId: currentUser.uid,
        title: "My First Journal",
        content: "Firestore connection test!",
        createdAt: serverTimestamp(),
      });

      alert("Journal saved successfully!");
    } catch (err) {
      console.error(err);
      setError("Firestore error: " + err.message);
    }
  };

  // Logged-in screen
  if (user) {
    return (
      <div>
        <h1>Personal Gemini Journal</h1>

        <h2>Welcome!</h2>

        <p>
          Logged in as: <strong>{user.email}</strong>
        </p>

        <button onClick={testFirestore}>
          Test Save Journal
        </button>

        <br />
        <br />

        <button onClick={handleLogout}>
          Logout
        </button>

        {error && <p>{error}</p>}
      </div>
    );
  }

  // Login / Signup screen
  return (
    <div>
      <h1>Personal Gemini Journal</h1>

      <h2>{isLogin ? "Login" : "Create Account"}</h2>

      <form onSubmit={handleAuth}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

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

export default App;