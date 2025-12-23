import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings");
        setData(res.data);
      } catch (err) {
        console.error(err);
        alert("Gagal mengambil data booking");
      }
    };

    fetchBookings();
  }, []);

  return (
    <div>
      <h2>Dashboard Admin</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>User</th>
            <th>Paket</th>
            <th>Tanggal</th>
            <th>Jam</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(b => (
            <tr key={b._id}>
              <td>{b.name}</td>
              <td>{b.package?.title}</td>
              <td>{b.date}</td>
              <td>{b.time}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
