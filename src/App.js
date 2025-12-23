import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BookingPage from "./pages/BookingPage";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./utils/PrivateRoute";
import Header from "./components/header";
import Footer from "./components/Footer";
import AdminPackages from "./pages/AdminPackages";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/booking/:packageId"
          element={
            <PrivateRoute roles={["customer", "admin", "manager"]}>
              <BookingPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <PrivateRoute roles={["manager"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
  path="/admin"
  element={
    <PrivateRoute role={["admin"]}>
      <AdminPackages />
    </PrivateRoute>
  }
/>

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
