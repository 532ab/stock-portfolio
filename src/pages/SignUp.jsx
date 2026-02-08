import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

export const SignUp = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        username,
        email,
        password,
      });

      const { token, username: resUsername, userId } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("username", resUsername);
      localStorage.setItem("userId", userId);

      setSuccess(true);

      onLoginSuccess(resUsername);

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
      className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-background text-gray-900 dark:text-gray-100 font-['Press_Start_2P'] px-6 md:px-20 py-12"
      style={{ fontFamily: "'Press Start 2P', cursive" }}
    >
      <div
        className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-10 max-w-lg w-full animate-fade-in"
        style={{ animation: "fade-in 0.7s ease-out forwards" }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-primary-foreground">
          Create an Account
        </h2>

        {success ? (
          <div className="text-center text-green-500">
            <h3 className="text-xl mb-2">Signup successful! 🎉</h3>
            <p>Redirecting to your portfolio...</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} noValidate>
              <label
                className="block mb-2 font-semibold text-gray-900 dark:text-gray-400"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full p-3 rounded border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-foreground dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 mb-4 animate-fade-in-delay-2"
                disabled={loading}
              />

              <label
                className="block mb-2 font-semibold text-gray-900 dark:text-gray-400"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                className="w-full p-3 rounded border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-foreground dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 mb-4 animate-fade-in-delay-3"
                disabled={loading}
              />

              <label
                className="block mb-2 font-semibold text-gray-900 dark:text-gray-400"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full p-3 rounded border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-foreground dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 mb-4 animate-fade-in-delay-4"
                disabled={loading}
              />

              <label
                className="block mb-2 font-semibold text-gray-900 dark:text-gray-400"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="w-full p-3 rounded border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-foreground dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 mb-4 animate-fade-in-delay-5"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-2.5 interesting-button float w-full text-gray-900 dark:text-gray-100"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>

              {error && (
                <p className="mt-4 text-red-600 dark:text-red-400 text-center animate-fade-in">
                  Error: {error}
                </p>
              )}
            </form>

            <p className="mt-4 text-center text-gray-700 dark:text-gray-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
