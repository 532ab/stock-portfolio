import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { useNavigate, useLocation } from "react-router-dom";
import { DarkModeSwitch } from "react-toggle-dark-mode";

export const Navbar = ({ dark, toggleDarkMode, user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveringMenu, setHoveringMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", id: "home" },
    { name: "Portfolio", id: "portfolio" },
  ];

  const menuRef = useRef();
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      const scrollPos = window.scrollY + window.innerHeight / 2;
      let current = "home";

      navItems.forEach(({ id }) => {
        const elem = document.getElementById(id);
        if (elem && elem.offsetTop <= scrollPos) {
          current = id;
        }
      });

      setActiveSection(current);
    };

    if (location.pathname === "/") {
      window.addEventListener("scroll", handleScroll);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !hoveringMenu
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, hoveringMenu]);

  const scrollToSection = (id) => {
    const elem = document.getElementById(id);
    if (elem) {
      window.scrollTo({
        top: elem.offsetTop,
        behavior: "smooth",
      });
    }
  };

  // Improved hover handlers with delay on hide
  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoveringMenu(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHoveringMenu(false);
      setMenuOpen(false);
    }, 200); // 200ms delay before hiding
  };

  return (
    <nav
      className={clsx(
        "fixed w-full z-40 transition-all duration-300",
        isScrolled ? "py-3 bg-gray-800/80 backdrop-blur-md shadow-md" : "py-5"
      )}
    >
      <div className="container flex items-center justify-between">
        <button
          onClick={() => {
            navigate("/");
            setTimeout(() => scrollToSection("home"), 50);
          }}
          className="text-xl font-bold text-primary flex items-center"
        >
          <span className="relative z-10">
            <span className="text-glow text-foreground animate-pulse border-primary">
              Stock
            </span>{" "}
            Portfolio
          </span>
        </button>

        <div className="flex space-x-8 items-center absolute left-1/2 transform -translate-x-1/2">
          <DarkModeSwitch
            checked={dark}
            onChange={toggleDarkMode}
            size={30}
            sunColor="#FBBF24"
            moonColor="#374151"
            className="ml-6"
          />
        </div>

        <div className="flex space-x-8 items-center">
          {location.pathname === "/" &&
            navItems.map(({ name, id }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={clsx(
                  "text-foreground/80 hover:text-primary transition-colors duration-300",
                  activeSection === id && "shine font-semibold animate-fade-in"
                )}
              >
                {name}
              </button>
            ))}

          {!user ? (
            <button
              onClick={() => navigate("/signup")}
              className="text-foreground/80 hover:text-primary transition-colors duration-300"
            >
              Signup
            </button>
          ) : (
            <div
              className="relative"
              ref={menuRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-foreground/80 hover:text-primary transition-colors duration-300"
              >
                {user.username}
              </button>
              {(menuOpen || hoveringMenu) && (
                <div className="absolute right-0 bg-gray-700 mt-2 rounded shadow p-2 min-w-[100px]">
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("username");
                      setMenuOpen(false);
                      setHoveringMenu(false);
                      onLogout();
                    }}
                    className="text-sm text-white hover:text-red-400 w-full text-left"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
