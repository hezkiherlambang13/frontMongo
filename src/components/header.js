import React from "react";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="brand">Online Shop</div>

      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        {/* <Link to="/cart">Cart</Link> */}

        {/* BELUM LOGIN */}
        {!token && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {/* ADMIN */}
        {token && role === "admin" && (
          <Link to="/admin">Admin</Link>
        )}

        {/* SUDAH LOGIN */}
        {token && (
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
