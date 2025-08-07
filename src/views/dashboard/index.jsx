"use client"

import { useEffect, useState } from "react"
import { Row, Col, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaUsers, FaExchangeAlt, FaGamepad, FaChartLine, FaStar, FaTrophy } from "react-icons/fa"
import { getData } from "../../../src/apiConfigs/apiCalls"
import { DASHBOARD } from "../../../src/apiConfigs/endpoints"

// Styles for circular progress bar
import "react-circular-progressbar/dist/styles.css"

const DashDefault = () => {
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalGames, setTotalGames] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [animatedValues, setAnimatedValues] = useState({ users: 0, games: 0, transactions: 0 })

  // Dark theme colors
  const darkTheme = {
    bgPrimary: "#0f0f0f",
    bgSecondary: "#1a1a1a",
    bgTertiary: "#2d2d2d",
    bgCard: "#1e1e1e",
    bgCardHover: "#252525",
    textPrimary: "#ffffff",
    textSecondary: "#b0b0b0",
    textMuted: "#888888",
    accent1: "#ff6b6b",
    accent2: "#4ecdc4",
    accent3: "#45b7d1",
    accent4: "#f9ca24",
    accent5: "#6c5ce7",
    shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
    shadowHover: "0 20px 40px 0 rgba(0, 0, 0, 0.7)",
    border: "rgba(255, 255, 255, 0.1)",
    borderHover: "rgba(255, 255, 255, 0.2)",
  }

  // Animate numbers
useEffect(() => {
  if (!loading && !error) {
    // Directly set the values without animation
    setAnimatedValues({
      users: totalUsers,
      games: totalGames,
      transactions: totalTransactions,
    });
  }
}, [totalUsers, totalGames, totalTransactions, loading, error]);

  // Fetch data from single DASHBOARD API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const dashboardRes = await getData(DASHBOARD)

        if (!dashboardRes) {
          setError("Failed to fetch dashboard data")
          setTotalUsers(0)
          setTotalGames(0)
          setTotalTransactions(0)
        } else {
          // Set data from single API response
          setTotalUsers(dashboardRes.totalUsers || 0)
          setTotalGames(dashboardRes.totalGames || 0)
          setTotalTransactions(dashboardRes.totalTransacions || 0) // Note: keeping the typo from backend

          console.log("Dashboard data fetched successfully:", dashboardRes)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Error fetching dashboard data")
        setTotalUsers(0)
        setTotalGames(0)
        setTotalTransactions(0)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Creative dashboard data with dark theme
  const dashSalesData = [
    {
      title: "Total Registered Users",
      textTransform: "none",
      value: animatedValues.users,
      actualValue: totalUsers,
      color: darkTheme.accent1,
      icon: <FaUsers size={32} />,
      link: "/usermanagement",
      gradient: `linear-gradient(135deg, ${darkTheme.accent1} 0%, #e55555 100%)`,
      bgPattern: `radial-gradient(circle at 20% 80%, ${darkTheme.accent1}20 0%, transparent 50%)`,
      trend: "+12%",
      // decorIcon: <FaStar size={16} />,
    },
    {
      title: "Total Transaction Users",
      value: animatedValues.transactions,
      actualValue: totalTransactions,
      color: darkTheme.accent2,
      icon: <FaExchangeAlt size={32} />,
      link: "/allwithdrawals",
      gradient: `linear-gradient(135deg, ${darkTheme.accent2} 0%, #3db5ac 100%)`,
      bgPattern: `radial-gradient(circle at 80% 20%, ${darkTheme.accent2}20 0%, transparent 50%)`,
      trend: "+8%",
      // decorIcon: <FaChartLine size={16} />,
    },
    {
      title: "Total Games",
      value: animatedValues.games,
      actualValue: totalGames,
      color: darkTheme.accent4,
      icon: <FaGamepad size={32} />,
      link: "/gamehistory",
      gradient: `linear-gradient(135deg, ${darkTheme.accent4} 0%, #e6b800 100%)`,
      bgPattern: `radial-gradient(circle at 50% 50%, ${darkTheme.accent4}20 0%, transparent 50%)`,
      trend: "+15%",
      // decorIcon: <FaTrophy size={16} />,
    },
  ]

  // Dark theme loading state
  if (loading) {
    return (
      <div
        style={{
          background: darkTheme.bgPrimary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated dark background elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: darkTheme.bgTertiary,
            animation: "float 6s ease-in-out infinite",
            opacity: "0.3",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60%",
            right: "15%",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: darkTheme.bgSecondary,
            animation: "float 8s ease-in-out infinite reverse",
            opacity: "0.2",
          }}
        />

        <div className="text-center">
          <div
            style={{
              width: "80px",
              height: "80px",
              border: `4px solid ${darkTheme.bgTertiary}`,
              borderTop: `4px solid ${darkTheme.accent3}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <h3 style={{ color: darkTheme.textPrimary, fontWeight: "300", marginBottom: "10px" }}>Loading Dashboard</h3>
          <p style={{ color: darkTheme.textSecondary }}>Fetching your analytics...</p>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    )
  }

  // Dark theme error state
  if (error) {
    return (
      <div
        style={{
          background: darkTheme.bgPrimary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: darkTheme.bgCard,
            border: `1px solid ${darkTheme.border}`,
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            maxWidth: "500px",
            boxShadow: darkTheme.shadow,
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: `linear-gradient(135deg, ${darkTheme.accent1}, #e55555)`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <i className="fas fa-exclamation-triangle" style={{ color: "#fff", fontSize: "32px" }} />
          </div>
          <h4 style={{ color: darkTheme.textPrimary, marginBottom: "15px" }}>Oops! Something went wrong</h4>
          <p style={{ color: darkTheme.textSecondary, marginBottom: "25px" }}>{error}</p>
          <Button
            onClick={() => window.location.reload()}
            style={{
              background: `linear-gradient(135deg, ${darkTheme.accent3}, #3a9bc1)`,
              border: "none",
              borderRadius: "25px",
              padding: "12px 30px",
              color: "#fff",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: darkTheme.bgPrimary,
        minHeight: "100vh",
        padding: "30px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dark floating background elements */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: darkTheme.bgSecondary,
          animation: "float 10s ease-in-out infinite",
          opacity: "0.3",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: darkTheme.bgTertiary,
          animation: "float 12s ease-in-out infinite reverse",
          opacity: "0.2",
        }}
      />

      {/* Dark theme header */}
      <div className="text-center mb-5">
        <h1
          style={{
            color: darkTheme.textPrimary,
            fontSize: "3rem",
            fontWeight: "50",
            marginBottom: "10px",
            textShadow: "0 4px 8px rgba(0,0,0,0.8)",
            letterSpacing: "1px",
            fontFamily: "Ubuntu",
          }}
        >
          {/* Dashboard
           */}
           Tetris Command Center
        </h1>
        {/* <div
          style={{
            width: "100px",
            height: "4px",
            background: `linear-gradient(90deg, ${darkTheme.accent1}, ${darkTheme.accent2}, ${darkTheme.accent4})`,
            margin: "0 auto 20px",
            borderRadius: "2px",
          }}
        /> */}

      </div>

      {/* Dark theme dashboard cards */}
      <Row className="justify-content-center g-4">
        {dashSalesData.map((data, index) => (
         <Col key={index} xl={4} lg={6} md={6} sm={12}>
  <Card
    style={{
      background: `${data.bgPattern}, ${darkTheme.bgCard}`,
      border: `1px solid ${darkTheme.border}`,
      borderRadius: "20px",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      boxShadow: darkTheme.shadow,
      position: "relative",
      minHeight: "80px", // Decreased height
    }}
    className="h-100"
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
      e.currentTarget.style.boxShadow = darkTheme.shadowHover;
      e.currentTarget.style.background = `${data.bgPattern}, ${darkTheme.bgCardHover}`;
      e.currentTarget.style.borderColor = darkTheme.borderHover;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.boxShadow = darkTheme.shadow;
      e.currentTarget.style.background = `${data.bgPattern}, ${darkTheme.bgCard}`;
      e.currentTarget.style.borderColor = darkTheme.border;
    }}
  >
    {/* Gradient top border */}
    <div
      style={{
        background: data.gradient,
        height: "5px",
        width: "100%",
      }}
    />

    {/* Decorative corner element */}
    <div
      style={{
        position: "absolute",
        top: "15px",  // Adjust position for smaller size
        right: "15px",
        color: data.color,
        opacity: "0.3",
      }}
    >
      {data.decorIcon}
    </div>

    <Card.Body className="p-3 text-center position-relative"> {/* Reduced padding */}
      {/* Icon with dark theme background */}
      <div className="mb-3">
        <div
          style={{
            width: "60px",  // Reduced size of the icon
            height: "60px", // Reduced size of the icon
            background: data.gradient,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: `0 10px 30px ${data.color}40`,
            position: "relative",
          }}
        >
          <div style={{ color: "#fff" }}>{data.icon}</div>

          {/* Pulse animation ring */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: `2px solid ${data.color}`,
              animation: "pulse 2s infinite",
              opacity: "0.6",
            }}
          />
        </div>
      </div>

      {/* Title and description */}
      <h5
        style={{
          color: darkTheme.textPrimary,
          fontWeight: "500",
          fontSize: "1.2rem", // Reduced font size
          marginBottom: "3px",
          textTransform: "none",
          letterSpacing: "1px",
        }}
      >
        {data.title}
      </h5>

      <p
        style={{
          color: darkTheme.textMuted,
          fontSize: "0.85rem",  // Reduced font size
          marginBottom: "20px",
        }}
      >
        {data.description}
      </p>

      {/* Animated value */}
      <div className="mb-3">
        <h2
          style={{
            color: data.color,
            fontSize: "2rem",  // Reduced font size
            fontWeight: "700",
            marginBottom: "5px",
            textShadow: `0 0 20px ${data.color}50`,
          }}
        >
          {data.value.toLocaleString()}
        </h2>
      </div>

      {/* Dark theme button */}
      <Link to={data.link} style={{ textDecoration: "none" }}>
        <Button
          style={{
            background: "transparent",
            border: `2px solid ${data.color}`,
            color: data.color,
            borderRadius: "20px",
            padding: "8px 20px", // Reduced padding
            fontWeight: "600",
            fontSize: "0.8rem", // Reduced font size
            textTransform: "none",
            letterSpacing: "1px",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = data.gradient;
            e.target.style.color = "#fff";
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = `0 5px 15px ${data.color}50`;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = data.color;
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
        >
          View Details
          <i className="fas fa-arrow-right ms-2" />
        </Button>
      </Link>
    </Card.Body>
  </Card>
</Col>

        ))}
      </Row>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default DashDefault
