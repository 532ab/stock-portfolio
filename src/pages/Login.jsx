import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, username, userId } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("userId", userId);

      setSuccess(true);

      onLoginSuccess(username);

      setTimeout(() => navigate("/"), 500); 

    } catch (err) {
      if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-background text-foreground font-['Press_Start_2P'] px-6 md:px-20 py-12"
      style={{ fontFamily: "'Press Start 2P', cursive" }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-10 max-w-lg w-full animate-fade-in"
        style={{ animation: "fade-in 0.7s ease-out forwards" }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-primary-foreground">
          Welcome Back!
        </h2>

        {success ? (
          <div className="text-center text-green-500">
            <h3 className="text-xl mb-2">Login successful! 🎉</h3>
            <p>Redirecting to your portfolio...</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} noValidate>
              <label className="block mb-2 font-semibold" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-foreground dark:bg-gray-800 dark:border-gray-700 mb-4 animate-fade-in-delay-2"
                disabled={loading}
              />

              <label className="block mb-2 font-semibold" htmlFor="password">
                Password
              </label>
              <div className="relative mb-4">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-foreground dark:bg-gray-800 dark:border-gray-700 animate-fade-in-delay-4"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sm text-primary-foreground hover:text-primary-foreground/80 select-none"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2.5 interesting-button float w-full"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {error && (
                <p className="mt-4 text-red-500 text-center animate-fade-in">
                  Error: {error}
                </p>
              )}
            </form>

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </>
        )}
      </div>

      <div
    className="hidden md:flex flex-col justify-center items-center max-w-md w-full ml-12 text-center animate-pulse-subtle rounded-lg p-8"
    style={{
    animation: "pulse-subtle 4s ease-in-out infinite",
    backgroundColor: "#1f2937",
    color: "#e5e7eb", 
    }}
    >
    <h3 className="text-4xl mb-4">
      Welcome to Your Portfolio
    </h3>
    <p className="text-lg leading-relaxed">
      Log in to manage your stocks, track live prices, and save favorites. Your personal dashboard awaits!
    </p>
  </div>

    </div>
  );
};
