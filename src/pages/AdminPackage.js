import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    date: "",
    time: "",
    duration: ""
  });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const res = await api.get("/api/packages");
    setPackages(res.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (editId) {
      await api.put(`/api/packages/${editId}`, form);
      setEditId(null);
    } else {
      await api.post("/api/packages", form);
    }
    setForm({ title:"",description:"",price:"",date:"",time:"",duration:"" });
    load();
  };

  const edit = (p) => {
    setEditId(p._id);
    setForm(p);
  };

  const remove = async (id) => {
    if (window.confirm("Hapus paket?")) {
      await api.delete(`/api/packages/${id}`);
      load();
    }
  };

  return (
    <div>
      <h2>Admin – Kelola Paket</h2>

      <input placeholder="Nama Paket" value={form.title}
        onChange={e=>setForm({...form,title:e.target.value})} />
      <input placeholder="Deskripsi" value={form.description}
        onChange={e=>setForm({...form,description:e.target.value})} />
      <input placeholder="Harga" value={form.price}
        onChange={e=>setForm({...form,price:e.target.value})} />
      <input placeholder="Tanggal" value={form.date}
        onChange={e=>setForm({...form,date:e.target.value})} />
      <input placeholder="Jam" value={form.time}
        onChange={e=>setForm({...form,time:e.target.value})} />
      <input placeholder="Durasi" value={form.duration}
        onChange={e=>setForm({...form,duration:e.target.value})} />

      <button onClick={submit}>
        {editId ? "Update Paket" : "Tambah Paket"}
      </button>

      <hr />

      {packages.map(p => (
        <div key={p._id}>
          <b>{p.title}</b> | Rp {p.price} | {p.date} {p.time}
          <button onClick={()=>edit(p)}>Edit</button>
          <button onClick={()=>remove(p._id)}>Hapus</button>
        </div>
      ))}
    </div>
  );
}
