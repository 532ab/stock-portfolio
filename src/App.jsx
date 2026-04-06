import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";

function ScrollSections({ setActiveSection, user }) {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      const handleScroll = () => {
        const scrollPos = window.scrollY + window.innerHeight / 2;
        let current = "home";

        ["home", "portfolio"].forEach((id) => {
          const elem = document.getElementById(id);
          if (elem && elem.offsetTop <= scrollPos) {
            current = id;
          }
        });

        setActiveSection(current);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [location, setActiveSection]);

  return (
    <main style={{ paddingTop: "4rem" }}>
      <Home />
      <Portfolio userId={user?._id} />
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const id = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    return id && username ? { _id: id, username } : null;
  });

  const [activeSection, setActiveSection] = useState("home");

  const handleLogin = (username) => {
    const userId = localStorage.getItem('userId');
    setUser({ _id: userId, username });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    const homeElem = document.getElementById("home");
    if (homeElem) homeElem.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        <Navbar user={user} onLogout={handleLogout} />

        <Routes>
          <Route
            path="/"
            element={<ScrollSections setActiveSection={setActiveSection} user={user} />}
          />
          <Route path="/signup" element={<SignUp onLoginSuccess={handleLogin} />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLogin} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
