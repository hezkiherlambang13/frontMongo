import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const res = await api.post("/users/login", {
        email,
        password
      });

      // SIMPAN TOKEN & USER
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ARAHKAN SESUAI ROLE
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (e) {
      alert(e.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={submit}>Login</button>
    </div>
  );
}
