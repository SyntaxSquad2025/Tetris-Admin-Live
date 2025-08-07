"use client"

import React, { useState, useEffect } from "react"
import { Alert, Spinner } from "react-bootstrap"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import * as Yup from "yup"
import { Formik } from "formik"
import { postData } from "../../../apiConfigs/apiCalls"
import { ADMIN_LOGIN } from "../../../apiConfigs/endpoints"
import Breadcrumb from "../../../layouts/AdminLayout/Breadcrumb"
import signInImg from "../../../../src/views/auth/sign-in.png"

const SignInGraphic = () => (
  <div
    style={{
      flex: 1,
      padding: "2rem",
      display: window.innerWidth >= 992 ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000",
      borderRadius: "12px 0 0 12px",
      overflow: "hidden",
      minHeight: "500px",
      position: "relative",
    }}
  >
    {/* Add subtle overlay for depth */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%)",
        zIndex: 1,
      }}
    />

    {/* Keep your original image */}
    <img
      src={signInImg || "/placeholder.svg"}
      alt="Sign In"
      style={{
        maxWidth: "100%",
        height: "auto",
        borderRadius: "8px",
        position: "relative",
        zIndex: 0,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseOver={(e) => {
        e.target.style.transform = "scale(1.02)"
        e.target.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.4)"
      }}
      onMouseOut={(e) => {
        e.target.style.transform = "scale(1)"
        e.target.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)"
      }}
    />
  </div>
)

const SignIn = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Load email and password from localStorage if available - YOUR EXISTING LOGIC
  useEffect(() => {
    const savedEmail = localStorage.getItem("email")
    const savedPassword = localStorage.getItem("password")
    if (savedEmail && savedPassword) {
      setRememberMe(true)
    }
  }, [])

  // YOUR EXISTING LOGIN LOGIC - UNCHANGED
  const handleLogin = async (values, { setSubmitting }) => {
    const { email, password } = values
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Email and password are required.")
      setLoading(false)
      setSubmitting(false)
      return
    }

    try {
      const data = await postData(ADMIN_LOGIN, { email, password })

      if (data && data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("id", data.user.id)

        if (rememberMe) {
          localStorage.setItem("email", email)
          localStorage.setItem("password", password)
        } else {
          localStorage.removeItem("email")
          localStorage.removeItem("password")
        }

        navigate("/dashboard")
      } else {
        setError(data.message || "Invalid email or password. Please try again.")
      }
    } catch (error) {
      setError(error.message || "Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  const containerStyles = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    position: "relative",
  }

  const cardStyles = {
    width: "100%",
    maxWidth: "1200px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    border: "none",
    backdropFilter: "blur(20px)",
  }

  const formContainerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 2rem",
    minHeight: "600px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  }

  const formStyles = {
    width: "100%",
    maxWidth: "400px",
  }

  const logoContainerStyles = {
    textAlign: "center",
    marginBottom: "2.5rem",
  }

  const logoIconStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    borderRadius: "20px",
    marginBottom: "1rem",
    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
    transform: "rotate(-5deg)",
    transition: "transform 0.3s ease",
  }

  const inputGroupStyles = {
    position: "relative",
    marginBottom: "1.5rem",
  }

  const inputStyles = {
    width: "100%",
    padding: "16px 16px 16px 50px",
    backgroundColor: "white",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    color: "#1a202c",
    fontSize: "16px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  }

  const inputFocusStyles = {
    outline: "none",
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
  }

  const iconStyles = {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    zIndex: 2,
  }

  const buttonStyles = {
    width: "100%",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: "600",
    padding: "16px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
    position: "relative",
    overflow: "hidden",
  }

  return (
    <React.Fragment>
      <Breadcrumb />

      <div style={containerStyles}>
        {/* Animated background elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "100px",
            height: "100px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "15%",
            width: "150px",
            height: "150px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />

        <div style={cardStyles}>
          <div style={{ display: "flex", minHeight: "600px" }}>
            {/* Left Side - Your Original Image */}
            <SignInGraphic />

            {/* Right Side - Enhanced Form */}
            <div style={formContainerStyles}>
              <div style={formStyles}>
                {/* Enhanced Logo */}
                <div style={logoContainerStyles}>
                  <div
                    style={logoIconStyles}
                    onMouseOver={(e) => {
                      e.target.style.transform = "rotate(0deg) scale(1.1)"
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "rotate(-5deg) scale(1)"
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "3px" }}>
                      <div
                        style={{ width: "12px", height: "12px", backgroundColor: "white", borderRadius: "2px" }}
                      ></div>
                      <div
                        style={{ width: "12px", height: "12px", backgroundColor: "white", borderRadius: "2px" }}
                      ></div>
                      <div
                        style={{ width: "12px", height: "12px", backgroundColor: "white", borderRadius: "2px" }}
                      ></div>
                      <div
                        style={{ width: "12px", height: "12px", backgroundColor: "white", borderRadius: "2px" }}
                      ></div>
                    </div>
                  </div>
                  <h2
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      margin: 0,
                    }}
                  >
                    TETRIS
                  </h2>
                </div>

                {/* Enhanced Form Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <h1
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "bold",
                      color: "#1a202c",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    Sign In
                  </h1>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>
                    Enter your email address and password to access admin panel.
                  </p>
                </div>

                {/* Enhanced Error Alert */}
                {error && (
                  <Alert
                    variant="danger"
                    style={{
                      backgroundColor: "#fef2f2",
                      borderColor: "#fecaca",
                      color: "#dc2626",
                      marginBottom: "1.5rem",
                      borderRadius: "12px",
                      border: "1px solid #fecaca",
                      boxShadow: "0 4px 6px rgba(220, 38, 38, 0.1)",
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* YOUR EXISTING FORMIK FORM WITH ENHANCED STYLING */}
                <Formik
                  initialValues={{
                    email: localStorage.getItem("email") || "",
                    password: localStorage.getItem("password") || "",
                    submit: null,
                  }}
                  validationSchema={Yup.object().shape({
                    email: Yup.string().email("Must be a valid email").max(255).required("Email is required"),
                    password: Yup.string().max(255).required("Password is required"),
                  })}
                  onSubmit={handleLogin}
                >
                  {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form onSubmit={handleSubmit}>
                      {/* Enhanced Email Field */}
                      <div style={inputGroupStyles}>
                        <label
                          htmlFor="email"
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#374151",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Email
                        </label>
                        <div style={{ position: "relative" }}>
                          <Mail size={20} style={iconStyles} />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="test@techzaa.com"
                            autoComplete="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={(e) => {
                              handleBlur(e)
                              e.target.style.transform = "translateY(0px)"
                              e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)"
                            }}
                            style={inputStyles}
                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyles)}
                          />
                        </div>
                        {touched.email && errors.email && (
                          <div
                            style={{
                              color: "#dc2626",
                              fontSize: "14px",
                              marginTop: "0.5rem",
                              fontWeight: "500",
                            }}
                          >
                            {errors.email}
                          </div>
                        )}
                      </div>

                      {/* Enhanced Password Field */}
                      <div style={inputGroupStyles}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <label htmlFor="password" style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                            Password
                          </label>
                          <Link
                            to="/auth/forgotpassword"
                            style={{
                              fontSize: "14px",
                              color: "#3b82f6",
                              textDecoration: "none",
                              fontWeight: "500",
                            }}
                          >
                            Reset password
                          </Link>
                        </div>
                        <div style={{ position: "relative" }}>
                          <Lock size={20} style={iconStyles} />
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={(e) => {
                              handleBlur(e)
                              e.target.style.transform = "translateY(0px)"
                              e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)"
                            }}
                            style={{ ...inputStyles, paddingRight: "50px" }}
                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyles)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: "absolute",
                              right: "16px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              color: "#64748b",
                              cursor: "pointer",
                              padding: "4px",
                              borderRadius: "4px",
                              transition: "color 0.2s ease",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.color = "#3b82f6"
                            }}
                            onMouseOut={(e) => {
                              e.target.style.color = "#64748b"
                            }}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {touched.password && errors.password && (
                          <div
                            style={{
                              color: "#dc2626",
                              fontSize: "14px",
                              marginTop: "0.5rem",
                              fontWeight: "500",
                            }}
                          >
                            {errors.password}
                          </div>
                        )}
                      </div>

                      {/* Enhanced Remember Me Checkbox */}
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
                        <input
                          type="checkbox"
                          id="customCheck1"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          style={{
                            marginRight: "0.75rem",
                            width: "18px",
                            height: "18px",
                            accentColor: "#3b82f6",
                          }}
                        />
                        <label htmlFor="customCheck1" style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}>
                          Remember me
                        </label>
                      </div>

                      {/* Enhanced Submit Button */}
                      <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        style={{
                          ...buttonStyles,
                          opacity: loading || isSubmitting ? 0.7 : 1,
                          cursor: loading || isSubmitting ? "not-allowed" : "pointer",
                        }}
                        onMouseOver={(e) => {
                          if (!loading && !isSubmitting) {
                            e.target.style.transform = "translateY(-2px)"
                            e.target.style.boxShadow = "0 15px 35px rgba(59, 130, 246, 0.4)"
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!loading && !isSubmitting) {
                            e.target.style.transform = "translateY(0px)"
                            e.target.style.boxShadow = "0 10px 25px rgba(59, 130, 246, 0.3)"
                          }
                        }}
                      >
                        {loading || isSubmitting ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Spinner animation="border" size="sm" style={{ marginRight: "0.5rem" }} />
                            Signing In...
                          </div>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </React.Fragment>
  )
}

export default SignIn