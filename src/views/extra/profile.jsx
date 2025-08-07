"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import {
  FaUser,
  FaEdit,
  FaLock,
  FaCamera,
  FaSave,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { getData, postData, putData } from "../../apiConfigs/apiCalls";
import {
  GET_PROFILE,
  EDIT_PROFILE,
  CHANGE_PASSWORD,
} from "../../apiConfigs/endpoints";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("id");

  // Dark theme colors (matching dashboard)
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
    accent2: "rgb(139, 92, 246)",
    accent3: "rgb(139, 92, 246)", // Changed to purple color
    accent4: "rgb(139, 92, 246)",
    accent5: "#6c5ce7",
    shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
    shadowHover: "0 20px 40px 0 rgba(0, 0, 0, 0.7)",
    border: "rgba(255, 255, 255, 0.1)",
    borderHover: "rgba(255, 255, 255, 0.2)",
    success: "rgb(139, 92, 246)",
    danger: "#dc3545",
  };

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    if (!userId) {
      setError("User is not logged in. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      const response = await getData(GET_PROFILE(userId));
      if (response?.user) {
        setUser(response.user);
        setEditedUser({ ...response.user }); // Ensure editedUser is set properly
        if (response.user.profilepic) {
          setProfileImage(response.user.profilepic);
        }
      }
    } catch (error) {
      setError("Failed to fetch profile data. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handlePasswordChange = () => setIsChangingPassword(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value, // Make sure the input name matches the key in the state object
    }));
  };

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = { ...editedUser, profilepic: profileImage };
      const response = await putData(EDIT_PROFILE(userId), updatedUser);

      if (response?.user) {
        setUser(response.user);
        setEditedUser(response.user);
        setProfileImage(response.user.profilepic);
        setMessage("Profile updated successfully!");
      }
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update profile. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    setLoading(true);
    try {
      const response = await postData(CHANGE_PASSWORD, {
        email: user.email,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      if (response?.message === "Password changed successfully") {
        setMessage("Password updated successfully!");
      } else {
        setError(response?.message || "Failed to change password.");
      }
      setIsChangingPassword(false);
    } catch (error) {
      setError("Failed to change password. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setProfileImage(imageURL);
    }
  };

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
        <div className="text-center">
          <div
            style={{
              width: "80px",
              height: "80px",
              border: `4px solid ${darkTheme.bgTertiary}`,
              borderTop: `4px solid rgb(139, 92, 246)`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <h3
            style={{
              color: darkTheme.textPrimary,
              fontWeight: "300",
              marginBottom: "10px",
            }}
          >
            Loading Profile
          </h3>
          <p style={{ color: darkTheme.textSecondary }}>
            Fetching your information...
          </p>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Dark theme error state
  if (error && !user) {
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
              background: `linear-gradient(135deg, ${darkTheme.danger}, #c82333)`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <i
              className="fas fa-exclamation-triangle"
              style={{ color: "#fff", fontSize: "32px" }}
            />
          </div>
          <h4 style={{ color: darkTheme.textPrimary, marginBottom: "15px" }}>
            Profile Error
          </h4>
          <p style={{ color: darkTheme.textSecondary, marginBottom: "25px" }}>
            {error}
          </p>
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
    );
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

      {/* Header */}
      {/* <div className="text-center mb-5">
        <h1
          style={{
            color: darkTheme.textPrimary,
            fontSize: "3rem",
            fontWeight: "100",
            marginBottom: "10px",
            textShadow: "0 4px 8px rgba(0,0,0,0.8)",
            letterSpacing: "2px",
          }}
        >
          Profile
        </h1>
        <div />
      </div> */}

      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          {/* Success/Error Messages */}
          {message && (
            <Alert
              style={{
                background: `${darkTheme.success}20`,
                border: `1px solid ${darkTheme.success}`,
                borderRadius: "15px",
                color: darkTheme.success,
                marginBottom: "20px",
              }}
            >
              <i className="fas fa-check-circle me-2" />
              {message}
            </Alert>
          )}

          {error && (
            <Alert
              style={{
                background: `${darkTheme.danger}20`,
                border: `1px solid ${darkTheme.danger}`,
                borderRadius: "15px",
                color: darkTheme.danger,
                marginBottom: "20px",
              }}
            >
              <i className="fas fa-exclamation-triangle me-2" />
              {error}
            </Alert>
          )}

          <Card
            style={{
              background: darkTheme.bgCard,
              border: `1px solid ${darkTheme.border}`,
              borderRadius: "25px",
              overflow: "hidden",
              boxShadow: darkTheme.shadow,
              transition: "all 0.3s ease",
            }}
          >
            {/* Card Header */}
            <div
              style={{
                background: `linear-gradient(135deg, rgb(139, 92, 246), #7c3aed)`,
                padding: "25px",
                textAlign: "center",
                position: "relative",
                display: "flex", // Added flex to align items in a row
                justifyContent: "center", // Centers the content horizontally
                alignItems: "center", // Aligns the items vertically
                gap: "10px", // Adds space between the icon and heading
              }}
            >
              <FaUser size={24} style={{ color: "#fff" }} />
              <h3 style={{ color: "#fff", margin: 0, fontWeight: "600" }}>
                User Profile
              </h3>
            </div>

            <Card.Body style={{ padding: "40px" }}>
              {/* Profile Image Section */}
              <div className="text-center mb-4">
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    marginBottom: "20px",
                  }}
                >
                  {profileImage ? (
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `4px solid rgb(139, 92, 246)`,
                        boxShadow: `0 10px 30px ${darkTheme.accent3}40`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${darkTheme.accent3}, rgb(139, 92, 246))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `4px solid ${darkTheme.border}`,
                        boxShadow: darkTheme.shadow,
                      }}
                    >
                      <FaUserCircle size={80} style={{ color: "#fff" }} />
                    </div>
                  )}

                  {isEditing && (
                    <div
                      style={{
                        marginTop: "15px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                        id="profile-image-input"
                      />
                      <label
                        htmlFor="profile-image-input"
                        style={{
                          background: `linear-gradient(135deg, ${darkTheme.accent4}, rgb(139, 92, 246))`,
                          color: "#fff",
                          padding: "10px 20px",
                          borderRadius: "25px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: "600",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {/* <FaCamera size={16} /> */}
                        Choose Photo
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Content */}
              {isEditing ? (
                // Edit Mode
                <Form>
                  <div className="mb-4">
                    <label
                      style={{
                        color: darkTheme.textSecondary,
                        fontSize: "14px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      userName
                    </label>
                    <Form.Control
                      name="userName" // Ensure this matches the key in `editedUser`
                      value={editedUser.userName || ""} // Ensure the username is correctly bound to the state
                      onChange={handleChange}
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "15px 20px",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgb(139, 92, 246)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(139, 92, 246, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkTheme.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div className="d-flex gap-3 justify-content-center">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      style={{
                        background: `linear-gradient(135deg, ${darkTheme.success}, rgb(139, 92, 246))`,
                        border: "none",
                        borderRadius: "25px",
                        padding: "12px 30px",
                        color: "#fff",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {loading ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <FaSave size={16} />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      style={{
                        background: "transparent",
                        border: `2px solid ${darkTheme.textMuted}`,
                        borderRadius: "25px",
                        padding: "12px 30px",
                        color: darkTheme.textMuted,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <FaTimes size={16} />
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : isChangingPassword ? (
                // Password Change Mode
                <Form>
                  <div className="mb-4">
                    <label
                      style={{
                        color: darkTheme.textSecondary,
                        fontSize: "14px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Current Password
                    </label>
                    <Form.Control
                      name="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordInputChange}
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "15px 20px",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgb(139, 92, 246)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(139, 92, 246, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkTheme.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      style={{
                        color: darkTheme.textSecondary,
                        fontSize: "14px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      New Password
                    </label>
                    <Form.Control
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "15px 20px",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgb(139, 92, 246)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(139, 92, 246, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkTheme.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      style={{
                        color: darkTheme.textSecondary,
                        fontSize: "14px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Confirm Password
                    </label>
                    <Form.Control
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "15px 20px",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgb(139, 92, 246)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(139, 92, 246, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkTheme.border;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div className="d-flex gap-3 justify-content-center">
                    <Button
                      onClick={handlePasswordSave}
                      disabled={loading}
                      style={{
                        background: `linear-gradient(135deg, ${darkTheme.accent1}, #e55555)`,
                        border: "none",
                        borderRadius: "25px",
                        padding: "12px 30px",
                        color: "#fff",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {loading ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <FaLock size={16} />
                          Change Password
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setIsChangingPassword(false)}
                      style={{
                        background: "transparent",
                        border: `2px solid ${darkTheme.textMuted}`,
                        borderRadius: "25px",
                        padding: "12px 30px",
                        color: darkTheme.textMuted,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <FaTimes size={16} />
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                // View Mode
                <div>
                  {/* User Information */}
                  <div className="mb-4">
                    <Row className="g-4">
                      <Col md={6}>
                        <div
                          style={{
                            background: darkTheme.bgSecondary,
                            border: `1px solid ${darkTheme.border}`,
                            borderRadius: "15px",
                            padding: "20px",
                          }}
                        >
                          <label
                          style={{
                              color: darkTheme.textPrimary,
                              fontSize: "18px",
                              fontWeight: "600",
                              margin: 0,
                              textTransform: "uppercase",
                            }}
                          >
                            Username
                          </label>
                          <p
                            style={{
                              color: darkTheme.textPrimary,
                              fontSize: "15px",
                              fontWeight: "200",
                              margin: 0,
                            }}
                          >
                            {user.userName || "N/A"}
                          </p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div
                          style={{
                            background: darkTheme.bgSecondary,
                            border: `1px solid ${darkTheme.border}`,
                            borderRadius: "15px",
                            padding: "20px",
                          }}
                        >
                          <label
                           style={{
                              color: darkTheme.textPrimary,
                              fontSize: "18px",
                              fontWeight: "600",
                              margin: 0,
                              textTransform: "uppercase",
                            }}
                          >
                            Email
                          </label>
                          <p
                            style={{
                              color: darkTheme.textPrimary,
                              fontSize: "15px",
                              fontWeight: "200",
                              margin: 0,
                            }}
                          >
                            {user.email || "N/A"}
                          </p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div
                          style={{
                            background: darkTheme.bgSecondary,
                            border: `1px solid ${darkTheme.border}`,
                            borderRadius: "15px",
                            padding: "20px",
                          }}
                        >
                          <label
                         style={{
                              color: darkTheme.textPrimary,
                              fontSize: "18px",
                              fontWeight: "600",
                              margin: 0,
                              textTransform: "uppercase",
                            }}
                          >
                            Login Type
                          </label>
                          <p
                            style={{
                              color: darkTheme.textPrimary,
                              fontSize: "15px",
                              fontWeight: "200",
                              margin: 0,
                            }}
                          >
                            {user.loginType || "N/A"}
                          </p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div
                          style={{
                            background: darkTheme.bgSecondary, // Same as other fields
                            border: `1px solid ${darkTheme.border}`, // Same as other fields
                            borderRadius: "15px",
                            padding: "20px",
                          }}
                        >
                          <label
                       style={{
                              color: darkTheme.textPrimary,
                              fontSize: "18px",
                              fontWeight: "600",
                              margin: 0,
                              textTransform: "uppercase",
                            }}
                          >
                            User Points
                          </label>
                          <p
                            style={{
                              color: darkTheme.textPrimary,
                              fontSize: "15px",
                              fontWeight: "200",
                              margin: 0,
                            }}
                          >
                            {user.ticketBalance || 0}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-3 justify-content-center mt-4">
                    <Button
                      onClick={handleEdit}
                      style={{
                        background: `linear-gradient(135deg, rgb(139, 92, 246), #7c3aed)`,
                        border: "none",
                        borderRadius: "25px",
                        padding: "12px 30px",
                        color: "#fff",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = `0 5px 15px ${darkTheme.accent3}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <FaEdit size={16} />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={handlePasswordChange}
                      style={{
                        background: `linear-gradient(135deg, ${darkTheme.accent1}, #e55555)`,
                        border: "none",
                        borderRadius: "25px",
                        padding: "12px 30px",
                        color: "#fff",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = `0 5px 15px ${darkTheme.accent1}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <FaLock size={16} />
                      Change Password
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
