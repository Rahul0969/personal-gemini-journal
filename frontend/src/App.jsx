import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUser(result.user);
      } else {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUser(result.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (user) {
    return (
      <div>
        <h1>Personal Gemini Journal</h1>
        <p>Welcome, {user.email}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

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
            : isLogin
            ? "Login"
            : "Create Account"}
        </button>
      </form>

      {error && <p>{error}</p>}

      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin
          ? "Don't have an account? Sign up"
          : "Already have an account? Login"}
      </button>
    </div>
  );
}

export default App;