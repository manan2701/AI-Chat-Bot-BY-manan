import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUser } from "../../store/userSlice";
import "./Navbar.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("https://mananborda-aichatbotpractice.onrender.com/api/auth/logout", {}, { withCredentials: true });
      dispatch(clearUser());
      window.location.reload()
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          {user ? (
            <>
              <Link onClick={handleLogout} className="logout-btn">Logout</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-btn">Login</Link>
              <Link to="/register" className="navbar-btn">Register</Link>
            </>
          )}
        </div>
        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
