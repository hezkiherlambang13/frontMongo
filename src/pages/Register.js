import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      alert("Register berhasil, silakan login");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Register gagal");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <input
        placeholder="Nama"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button>Register</button>
    </form>
  );
}
