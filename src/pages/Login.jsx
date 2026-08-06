import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/entities");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "4rem auto" }}>
      <h2>ARGUS Login</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", marginBottom: 8 }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", marginBottom: 8 }} />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ width: "100%" }}>Log in</button>
        <p style={{ marginTop: 8 }}>No account? <Link to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}