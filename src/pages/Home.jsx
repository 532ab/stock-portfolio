export default function Home() {
  const features = [
    { title: "Live Prices", desc: "Real-time stock data updated throughout the trading day." },
    { title: "Portfolio Tracking", desc: "Monitor your holdings, gain/loss, and overall performance." },
    { title: "Search & Filter", desc: "Quickly find stocks and sort by price, change, or value." },
    { title: "Price Charts", desc: "Interactive charts to visualize historical price trends." },
    { title: "Secure Auth", desc: "Your portfolio data is protected with JWT authentication." },
  ];

  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        padding: "3rem 2rem",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "2.2rem", marginBottom: "0.5rem", textAlign: "center", fontWeight: 700 }}>
        Stock Portfolio
      </h1>
      <p style={{ textAlign: "center", marginBottom: "2.5rem", opacity: 0.6, fontSize: "1.1rem" }}>
        Track your investments with real-time data and interactive charts.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              padding: "1.5rem",
              lineHeight: 1.6,
              fontSize: "0.95rem",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <h3 style={{ fontWeight: 600, marginBottom: "0.4rem", fontSize: "1.05rem" }}>{f.title}</h3>
            <p style={{ opacity: 0.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
