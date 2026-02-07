import React from "react";
import "./Home.css"; // We'll put animation CSS here

export default function Home() {
  const colors = [
    "#8b5cf6",
    "#a78bfa",
    "#c4b5fd",
    "#ddd6fe",
    "#e0c3fc",
    "#f3d9fa",
  ];

  const content = [
    <>
      <p>
        This app helps you keep track of your stocks easily. Whether you’re just
        starting or already know your way around the market, it makes investing
        simple.
      </p>
      <p>
        It pulls live stock data and shows it with charts and tables so you can
        follow your portfolio.
      </p>
    </>,
    <>
      <p>Here’s what you can do:</p>
      <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
        <li>📈 See live stock prices</li>
        <li>💼 Track your portfolio</li>
        <li>⭐ Save favorite stocks</li>
        <li>🔐 Secure login</li>
        <li>🌙 Light/Dark mode</li>
      </ul>
    </>,
    <>
      <p>The goal is to give you easy tools so you can make smart moves.</p>
      <p>Just sign up or log in to start using your dashboard and charts.</p>
      <p>More features coming soon!</p>
    </>,
    <>
      <p>Scroll down to check out your portfolio, favorites, and login pages to start managing your stocks.</p>
    </>,
    <>
      <p>Manage your favorite stocks easily by adding them to your watchlist.</p>
    </>,
    <>
      <p>Use live charts to analyze market trends and make better decisions.</p>
    </>,
  ];

  return (
    <section id="home" className="home-section">
      <h1 className="home-title">Welcome to Stock Portfolio</h1>

      <div className="home-grid">
        {content.map((block, i) => (
          <div
            key={i}
            className="home-box"
            style={{
              borderColor: colors[i],
              boxShadow: `0 4px 8px ${colors[i]}50`,
              color: "var(--primary-text)",
            }}
          >
            <div className="star-wars-crawl">{block}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
