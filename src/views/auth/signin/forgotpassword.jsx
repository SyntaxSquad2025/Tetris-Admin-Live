"use client";

import React, { useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { postData } from "../../../apiConfigs/apiCalls";
import { FORGOT_PASSWORD, RESET_PASSWORD } from "../../../apiConfigs/endpoints";
import Breadcrumb from "../../../layouts/AdminLayout/Breadcrumb";
import signInImg from "../../../../src/views/auth/sign-in.png";

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
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%)",
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
        e.target.style.transform = "scale(1.02)";
        e.target.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.4)";
      }}
      onMouseOut={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
      }}
    />
  </div>
);

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setOtp(""); // Reset OTP field
    setNewPassword(""); // Reset New Password field
    setConfirmPassword(""); // Reset Confirm Password field

    if (!email) {
      setError("Email is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await postData(FORGOT_PASSWORD, { email });

      if (response && response.success !== false) {
        setSuccess("OTP sent to your email.");
        setStep(2);
      } else {
        setError(response?.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Updated handleResetPassword function
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setOtp(""); // Reset OTP field
    setNewPassword(""); // Reset New Password field
    setConfirmPassword(""); // Reset Confirm Password field

    // Validation
    if (!otp || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // FIXED: Ensure all required fields are sent as strings
      const requestData = {
        otp: Number(otp.trim()), // Convert OTP to a number
        newPassword: newPassword,
        confirmPassword: confirmPassword,
        email: email,
      };

      console.log("Sending reset password request:", requestData); // Debug log

      const response = await postData(RESET_PASSWORD, requestData);

      console.log("Reset password response:", response); // Debug log

      if (response && response.success !== false) {
        setSuccess("Password reset successfully.");
        setTimeout(() => navigate("/"), 3000);
      } else {
        setError(
          response?.message || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      console.error("Reset password error:", error); // Debug log
      setError(
        error?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Styles (keeping all your existing styles)
  const containerStyles = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    position: "relative",
  };

  const cardStyles = {
    width: "100%",
    maxWidth: "1200px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    boxShadow:
      "0 30px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    border: "none",
    backdropFilter: "blur(20px)",
  };

  const formContainerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 2rem",
    minHeight: "600px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  };

  const formStyles = {
    width: "100%",
    maxWidth: "400px",
  };

  const logoContainerStyles = {
    textAlign: "center",
    marginBottom: "2.5rem",
  };

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
  };

  const inputGroupStyles = {
    position: "relative",
    marginBottom: "1.5rem",
  };

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
  };

  const inputFocusStyles = {
    outline: "none",
    borderColor: "#3b82f6",
    boxShadow:
      "0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
  };

  const iconStyles = {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    zIndex: 2,
  };

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
  };

  const linkStyles = {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    transition: "color 0.2s ease",
  };

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
                      e.target.style.transform = "rotate(0deg) scale(1.1)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "rotate(-5deg) scale(1)";
                    }}
                  >
                    {step === 1 ? (
                      <Mail size={32} color="white" />
                    ) : (
                      <KeyRound size={32} color="white" />
                    )}
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

                {/* Step 1: Request OTP */}
                {step === 1 ? (
                  <div>
                    {/* Form Header */}
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                      <h1
                        style={{
                          fontSize: "1.8rem",
                          fontWeight: "bold",
                          color: "#1a202c",
                          margin: "0 0 0.5rem 0",
                        }}
                      >
                        Forgot Password
                      </h1>
                      <p
                        style={{
                          color: "#64748b",
                          margin: 0,
                          fontSize: "1rem",
                        }}
                      >
                        Enter your registered email address, we will send a
                        verification code.
                      </p>
                    </div>

                    {/* Error and Success Messages */}
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
                    {success && (
                      <Alert
                        variant="success"
                        style={{
                          backgroundColor: "#f0fdf4",
                          borderColor: "#bbf7d0",
                          color: "#16a34a",
                          marginBottom: "1.5rem",
                          borderRadius: "12px",
                          border: "1px solid #bbf7d0",
                          boxShadow: "0 4px 6px rgba(22, 163, 74, 0.1)",
                        }}
                      >
                        {success}
                      </Alert>
                    )}

                    {/* Email Form */}
                    <form onSubmit={handleForgotPassword}>
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
                          Email Address
                        </label>
                        <div style={{ position: "relative" }}>
                          <Mail size={20} style={iconStyles} />
                          <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyles}
                            onFocus={(e) =>
                              Object.assign(e.target.style, inputFocusStyles)
                            }
                            onBlur={(e) => {
                              e.target.style.transform = "translateY(0px)";
                              e.target.style.boxShadow =
                                "0 4px 6px rgba(0, 0, 0, 0.05)";
                            }}
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          ...buttonStyles,
                          opacity: loading ? 0.7 : 1,
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                        onMouseOver={(e) => {
                          if (!loading) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow =
                              "0 15px 35px rgba(59, 130, 246, 0.4)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!loading) {
                            e.target.style.transform = "translateY(0px)";
                            e.target.style.boxShadow =
                              "0 10px 25px rgba(59, 130, 246, 0.3)";
                          }
                        }}
                      >
                        {loading ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Spinner
                              animation="border"
                              size="sm"
                              style={{ marginRight: "0.5rem" }}
                            />
                            Sending OTP...
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Send size={18} style={{ marginRight: "0.5rem" }} />
                            Send OTP
                          </div>
                        )}
                      </button>

                      {/* Back to Login Link */}
                      <div style={{ textAlign: "center", marginTop: "2rem" }}>
                        <Link
                          to="/"
                          style={linkStyles}
                          onMouseOver={(e) => {
                            e.target.style.color = "#2563eb";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color = "#3b82f6";
                          }}
                        >
                          <ArrowLeft
                            size={16}
                            style={{ marginRight: "0.5rem" }}
                          />
                          Back to Login
                        </Link>
                      </div>
                    </form>
                  </div>
                ) : (
                  // Step 2: Reset Password
                  <div>
                    {/* Form Header */}
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                      <h1
                        style={{
                          fontSize: "1.8rem",
                          fontWeight: "bold",
                          color: "#1a202c",
                          margin: "0 0 0.5rem 0",
                        }}
                      >
                        Reset Password
                      </h1>
                      <p
                        style={{
                          color: "#64748b",
                          margin: 0,
                          fontSize: "1rem",
                        }}
                      >
                        Enter the OTP sent to your email and your new password
                      </p>
                    </div>

                    {/* Error and Success Messages */}
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
                    {success && (
                      <Alert
                        variant="success"
                        style={{
                          backgroundColor: "#f0fdf4",
                          borderColor: "#bbf7d0",
                          color: "#16a34a",
                          marginBottom: "1.5rem",
                          borderRadius: "12px",
                          border: "1px solid #bbf7d0",
                          boxShadow: "0 4px 6px rgba(22, 163, 74, 0.1)",
                        }}
                      >
                        {success}
                      </Alert>
                    )}

                    {/* Reset Password Form */}
                    <form onSubmit={handleResetPassword}>
                      {/* OTP Field */}
                      <div style={inputGroupStyles}>
                        <label
                          htmlFor="otp"
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#374151",
                            marginBottom: "0.5rem",
                          }}
                        >
                          OTP
                        </label>
                        <div style={{ position: "relative" }}>
                          <KeyRound size={20} style={iconStyles} />
                          <input
                            type="text"
                            id="otp"
                            placeholder="Enter OTP code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            style={inputStyles}
                            onFocus={(e) =>
                              Object.assign(e.target.style, inputFocusStyles)
                            }
                            onBlur={(e) => {
                              e.target.style.transform = "translateY(0px)";
                              e.target.style.boxShadow =
                                "0 4px 6px rgba(0, 0, 0, 0.05)";
                            }}
                          />
                        </div>
                      </div>

                      {/* New Password Field */}
                      <div style={inputGroupStyles}>
                        <label
                          htmlFor="newPassword"
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#374151",
                            marginBottom: "0.5rem",
                          }}
                        >
                          New Password
                        </label>
                        <div style={{ position: "relative" }}>
                          <Lock size={20} style={iconStyles} />
                          <input
                            type={showPassword ? "text" : "password"}
                            id="newPassword"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ ...inputStyles, paddingRight: "50px" }}
                            onFocus={(e) =>
                              Object.assign(e.target.style, inputFocusStyles)
                            }
                            onBlur={(e) => {
                              e.target.style.transform = "translateY(0px)";
                              e.target.style.boxShadow =
                                "0 4px 6px rgba(0, 0, 0, 0.05)";
                            }}
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
                              e.target.style.color = "#3b82f6";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.color = "#64748b";
                            }}
                          >
                            {showPassword ? (
                              <Eye size={20} />
                            ) : (
                              <EyeOff size={20} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div style={inputGroupStyles}>
                        <label
                          htmlFor="confirmPassword"
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#374151",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Confirm Password
                        </label>
                        <div style={{ position: "relative" }}>
                          <Lock size={20} style={iconStyles} />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ ...inputStyles, paddingRight: "50px" }}
                            onFocus={(e) =>
                              Object.assign(e.target.style, inputFocusStyles)
                            }
                            onBlur={(e) => {
                              e.target.style.transform = "translateY(0px)";
                              e.target.style.boxShadow =
                                "0 4px 6px rgba(0, 0, 0, 0.05)";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
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
                              e.target.style.color = "#3b82f6";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.color = "#64748b";
                            }}
                          >
                            {showConfirmPassword ? (
                              <Eye size={20} />
                            ) : (
                              <EyeOff size={20} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          ...buttonStyles,
                          opacity: loading ? 0.7 : 1,
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                        onMouseOver={(e) => {
                          if (!loading) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow =
                              "0 15px 35px rgba(59, 130, 246, 0.4)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!loading) {
                            e.target.style.transform = "translateY(0px)";
                            e.target.style.boxShadow =
                              "0 10px 25px rgba(59, 130, 246, 0.3)";
                          }
                        }}
                      >
                        {loading ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Spinner
                              animation="border"
                              size="sm"
                              style={{ marginRight: "0.5rem" }}
                            />
                            Resetting Password...
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <RefreshCw
                              size={18}
                              style={{ marginRight: "0.5rem" }}
                            />
                            Reset Password
                          </div>
                        )}
                      </button>

                      {/* Back to Previous Step Link */}
                      <div style={{ textAlign: "center", marginTop: "2rem" }}>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setStep(1);
                            setError("");
                            setSuccess("");
                          }}
                          style={linkStyles}
                          onMouseOver={(e) => {
                            e.target.style.color = "#2563eb";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color = "#3b82f6";
                          }}
                        >
                          <ArrowLeft
                            size={16}
                            style={{ marginRight: "0.5rem" }}
                          />
                          Back to Previous Step
                        </a>
                      </div>
                    </form>
                  </div>
                )}
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
  );
};

export default ForgotPassword;