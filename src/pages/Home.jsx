export default function Home() {
  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        padding: "3rem 2rem",
        color: "var(--primary-text)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
        boxSizing: "border-box",
        maxWidth: 1200,
        margin: "0 auto",
        animation: "fade-in 1.5s ease-in-out",
        fontFamily: "'Press Start 2P', cursive",
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontSize: "1.8rem",
          marginBottom: "1.5rem",
          padding: "0.5rem",
          gridColumn: "1 / -1",
          textAlign: "center",
          borderBottom: "2px solid #8b5cf6",
        }}
      >
        Welcome to Stock Portfolio
      </h1>

      {/* Boxes */}
      {[...Array(6)].map((_, i) => {
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
              This app helps you keep track of your stocks easily. Whether you’re
              just starting or already know your way around the market, it makes
              investing simple.
            </p>
            <p>
              It pulls live stock data and shows it with charts and tables so you
              can follow your portfolio.
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
            <p>
              Just sign up or log in to start using your dashboard and charts.
            </p>
            <p>More features coming soon!</p>
          </>,
          <>
            <p>
              Scroll down to check out your portfolio, favorites, and login pages
              to start managing your stocks.
            </p>
          </>,
          <>
            <p>
              Manage your favorite stocks easily by adding them to your watchlist.
            </p>
          </>,
          <>
            <p>
              Use live charts to analyze market trends and make better decisions.
            </p>
          </>,
        ];

        return (
          <div
            key={i}
            style={{
              position: "relative",
              height: 180,
              overflow: "hidden",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: `1px solid ${colors[i]}`,
              borderRadius: "10px",
              boxShadow: `0 4px 8px ${colors[i]}50`,
              padding: "1rem",
              lineHeight: 1.6,
              fontSize: "1rem",
              color: "var(--primary-text)",
            }}
          >
            <div className="box-star-wars-crawl">
              {content[i]}
            </div>
          </div>
        );
      })}
    </section>
  );
}
