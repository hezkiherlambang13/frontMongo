import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);

  // AMBIL DATA DARI BACKEND
  useEffect(() => {
    api.get("/api/products")
      .then((res) => {
        setPackages(res.data);
      })
      .catch((err) => {
        console.error("GAGAL AMBIL DATA:", err);
      });
  }, []);

  return (
    <div>
      <h1>Selamat Datang di Online Shop</h1>
      <p>Belanja mudah, cepat, dan aman.</p>

      <h2>Daftar Paket</h2>

      {packages.length === 0 && <p>Loading data...</p>}

      {packages.map((pkg) => (
        <div key={pkg._id} style={{ marginBottom: "10px" }}>
          <span>{pkg.name}</span>
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => navigate(`/booking/${pkg._id}`)}
          >
            Pesan
          </button>
        </div>
      ))}
    </div>
  );
}
