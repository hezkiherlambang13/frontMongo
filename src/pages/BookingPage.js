import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function BookingPage() {
  const { packageId } = useParams();

  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: ""
  });

  const submit = async () => {
    if (!date || !time) {
      alert("Tanggal dan jam wajib dipilih");
      return;
    }

    await axios.post(
      "http://localhost:5000/api/bookings",
      {
        package: packageId,
        date,
        time,
        ...form
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert("Booking berhasil");
  };

  return (
    <>
      <Calendar onChange={setDate} />

      <select onChange={(e) => setTime(e.target.value)}>
        <option value="">Pilih Jam</option>
        <option value="09:00">09:00</option>
        <option value="11:00">11:00</option>
        <option value="13:00">13:00</option>
      </select>

      <input placeholder="Nama Lengkap"
        onChange={(e) => setForm({ ...form, name: e.target.value })} />

      <input placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })} />

      <input placeholder="WhatsApp"
        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />

      <button onClick={submit}>Booking</button>
    </>
  );
}
