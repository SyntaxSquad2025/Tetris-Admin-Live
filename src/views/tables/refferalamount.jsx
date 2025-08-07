"use client"

import { useState, useEffect } from "react"
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CContainer,
  CAlert,
  CFormInput,
  CFormTextarea,
  CFormSelect,
} from "@coreui/react"
import { getData, postData } from "../../../src/apiConfigs/apiCalls"
import { GET_REFERRAL_REWARD, ADMIN_SET_REFERRAL_REWARD } from "../../../src/apiConfigs/endpoints"
import { FaCog, FaGift, FaRobot, FaEdit } from "react-icons/fa"

const ReferralReward = () => {
  const [referralSettings, setReferralSettings] = useState({
    referralAmount: "",
    signupBonus: "",
    referral_Note: "",
    botName: "",
    Status: "active",
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  // Dark theme colors (matching tasks page)
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
    accent3: "rgb(139, 92, 246)", // Purple color
    accent4: "#f9ca24",
    accent5: "#6c5ce7",
    shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
    shadowHover: "0 20px 40px 0 rgba(0, 0, 0, 0.7)",
    border: "rgba(255, 255, 255, 0.1)",
    borderHover: "rgba(255, 255, 255, 0.2)",
    success: "#28a745",
    danger: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  }

  // Fetch referral settings
  const fetchReferralSettings = async () => {
    setFetchLoading(true)
    try {
      const response = await getData(GET_REFERRAL_REWARD)
      console.log("API Response:", response) // Debug log

      // Based on your console output, the data is in response.referralSettings
      let data = null

      if (response?.referralSettings) {
        data = response.referralSettings
      } else if (response?.data?.referralSettings) {
        data = response.data.referralSettings
      } else if (response?.data) {
        data = response.data
      }

      if (data) {
        console.log("Setting data:", data) // Debug log

        // If data is an array, find the active record
        let activeRecord = null
        if (Array.isArray(data)) {
          activeRecord = data.find((record) => record.status === "ACTIVE")
          console.log("Found active record:", activeRecord)
        } else {
          activeRecord = data
        }

        if (activeRecord) {
          setReferralSettings({
            referralAmount: activeRecord.referralAmount?.toString() || "",
            signupBonus: activeRecord.signupBonus?.toString() || "",
            referral_Note: activeRecord.referral_Note || "",
            botName: activeRecord.botName || "",
            Status: activeRecord.status?.toLowerCase() || "active",
          })

          // Show info message about loaded data
          // setMessage({
          //   text: "Referral settings loaded successfully",
          //   type: "info",
          // })

          // Clear the info message after 3 seconds
          setTimeout(() => {
            setMessage({ text: "", type: "" })
          }, 3000)
        } else {
          console.log("No active record found") // Debug log
          setMessage({
            text: "No active referral settings found. You can create new settings.",
            type: "info",
          })
        }
      } else {
        console.log("No data found in response") // Debug log
        setMessage({
          text: "No existing referral settings found. You can create new settings.",
          type: "info",
        })
      }
    } catch (error) {
      console.error("Error fetching referral settings:", error)
      setMessage({
        text: "Failed to load referral settings. Please try again.",
        type: "danger",
      })
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchReferralSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setReferralSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const clearMessage = () => {
    setTimeout(() => setMessage({ text: "", type: "" }), 5000)
  }

  // Save referral settings
  const handleSaveReferralSettings = async () => {
    // Validation checks
    if (!referralSettings.referralAmount || !referralSettings.signupBonus) {
      setMessage({
        text: "Please fill in all required fields",
        type: "danger",
      })
      return
    }

    setLoading(true)
    try {
      const requestBody = {
        referralAmount: Number(referralSettings.referralAmount),
        signupBonus: Number(referralSettings.signupBonus),
        referral_Note: referralSettings.referral_Note,
        botName: referralSettings.botName,
        Status: referralSettings.Status,
      }

      console.log("Sending request:", requestBody) // Debug log
      const response = await postData(ADMIN_SET_REFERRAL_REWARD, requestBody)
      console.log("Save response:", response) // Debug log

      if (response) {
        setMessage({
          text: response.message || "Referral settings updated successfully!",
          type: "success",
        })

        // If there's updated data in the response, update the state
        // Check for the same nested structure as in GET response
        let updatedData = null
        if (response.referralSettings) {
          updatedData = response.referralSettings
        } else if (response.data?.referralSettings) {
          updatedData = response.data.referralSettings
        } else if (response.data) {
          updatedData = response.data
        }

        if (updatedData) {
          setReferralSettings({
            referralAmount: updatedData.referralAmount?.toString() || referralSettings.referralAmount,
            signupBonus: updatedData.signupBonus?.toString() || referralSettings.signupBonus,
            referral_Note: updatedData.referral_Note || referralSettings.referral_Note,
            botName: updatedData.botName || referralSettings.botName,
            Status: updatedData.Status || referralSettings.Status,
          })
        }
      } else {
        setMessage({
          text: "Failed to update referral settings",
          type: "danger",
        })
      }
    } catch (error) {
      console.error("Error saving referral settings:", error)
      setMessage({
        text: error.message || "Failed to save referral settings",
        type: "danger",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
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
              borderTop: `4px solid ${darkTheme.accent3}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <h3 style={{ color: darkTheme.textPrimary, fontWeight: "300", marginBottom: "10px" }}>Loading Settings</h3>
          <p style={{ color: darkTheme.textSecondary }}>Fetching referral settings...</p>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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

      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCard
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
              <CCardHeader
                style={{
                  background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                  padding: "25px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
                className="text-center"
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FaCog size={24} style={{ color: "#fff", marginRight: "10px" }} />
                  <h5 style={{ color: "#fff", margin: 0, fontWeight: "600" }}>Referral Settings</h5>
                </div>
              </CCardHeader>

              <CCardBody style={{ padding: "40px" }}>
                {/* Success/Error Messages */}
                {message.text && (
                  <CAlert
                    color={
                      message.type === "success"
                        ? "success"
                        : message.type === "danger"
                          ? "danger"
                          : message.type === "warning"
                            ? "warning"
                            : "info"
                    }
                    style={{
                      background: `${
                        message.type === "success"
                          ? darkTheme.success
                          : message.type === "danger"
                            ? darkTheme.danger
                            : message.type === "warning"
                              ? darkTheme.warning
                              : darkTheme.info
                      }20`,
                      border: `1px solid ${
                        message.type === "success"
                          ? darkTheme.success
                          : message.type === "danger"
                            ? darkTheme.danger
                            : message.type === "warning"
                              ? darkTheme.warning
                              : darkTheme.info
                      }`,
                      borderRadius: "15px",
                      color:
                        message.type === "success"
                          ? darkTheme.success
                          : message.type === "danger"
                            ? darkTheme.danger
                            : message.type === "warning"
                              ? darkTheme.warning
                              : darkTheme.info,
                      marginBottom: "20px",
                    }}
                    dismissible
                    onClose={() => setMessage({ text: "", type: "" })}
                  >
                    <i
                      className={`fas ${
                        message.type === "success"
                          ? "fa-check-circle"
                          : message.type === "danger"
                            ? "fa-exclamation-triangle"
                            : message.type === "warning"
                              ? "fa-exclamation-triangle"
                              : "fa-info-circle"
                      } me-2`}
                    />
                    {message.text}
                  </CAlert>
                )}

                {/* Referral Amount */}
                <div className="mb-4">
                  <CFormLabel
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaGift size={16} style={{ marginRight: "8px", color: darkTheme.accent3 }} />
                    Referral Amount
                  </CFormLabel>
                  <div className="position-relative">
                    <CFormInput
                      type="number"
                      name="referralAmount"
                      value={referralSettings.referralAmount}
                      onChange={handleChange}
                      placeholder="Enter referral reward amount"
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "15px 20px",
                        fontSize: "16px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = darkTheme.accent3
                        e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.2)`
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkTheme.border
                        e.target.style.boxShadow = "none"
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Signup Bonus */}
                <div className="mb-4">
                  <CFormLabel
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaGift size={16} style={{ marginRight: "8px", color: darkTheme.accent4 }} />
                    Signup Bonus
                  </CFormLabel>
                  <div className="position-relative">
                    <CFormInput
                      type="number"
                      name="signupBonus"
                      value={referralSettings.signupBonus}
                      onChange={handleChange}
                      placeholder="Enter signup bonus amount"
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "15px 20px",
                        fontSize: "16px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = darkTheme.accent3
                        e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.2)`
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkTheme.border
                        e.target.style.boxShadow = "none"
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Referral Note */}
                <div className="mb-4">
                  <CFormLabel
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaEdit size={16} style={{ marginRight: "8px", color: darkTheme.accent2 }} />
                    Referral Note
                  </CFormLabel>
                  <CFormTextarea
                    name="referral_Note"
                    value={referralSettings.referral_Note}
                    onChange={handleChange}
                    placeholder="Enter referral note or description"
                    rows={3}
                    style={{
                      background: darkTheme.bgSecondary,
                      border: `1px solid ${darkTheme.border}`,
                      borderRadius: "15px",
                      color: darkTheme.textPrimary,
                      padding: "15px 20px",
                      fontSize: "16px",
                      resize: "vertical",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = darkTheme.accent3
                      e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.2)`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = darkTheme.border
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>

                {/* Bot Name */}
                <div className="mb-4">
                  <CFormLabel
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaRobot size={16} style={{ marginRight: "8px", color: darkTheme.accent1 }} />
                    Bot Name
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="botName"
                    value={referralSettings.botName}
                    onChange={handleChange}
                    placeholder="Enter bot name"
                    style={{
                      background: darkTheme.bgSecondary,
                      border: `1px solid ${darkTheme.border}`,
                      borderRadius: "15px",
                      color: darkTheme.textPrimary,
                      padding: "15px 20px",
                      fontSize: "16px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = darkTheme.accent3
                      e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.2)`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = darkTheme.border
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>

                {/* Status */}
                <div className="mb-4">
                  <CFormLabel
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <i className="fas fa-toggle-on" style={{ marginRight: "8px", color: darkTheme.accent5 }} />
                    Status
                  </CFormLabel>
                  <CFormSelect
                    name="Status"
                    value={referralSettings.Status}
                    onChange={handleChange}
                    style={{
                      background: darkTheme.bgSecondary,
                      border: `1px solid ${darkTheme.border}`,
                      borderRadius: "15px",
                      color: darkTheme.textPrimary,
                      padding: "15px 20px",
                      fontSize: "16px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = darkTheme.accent3
                      e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.2)`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = darkTheme.border
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </CFormSelect>
                </div>

                {/* Save Button */}
                <div className="d-flex justify-content-center mt-5">
                  <CButton
                    onClick={handleSaveReferralSettings}
                    disabled={loading}
                    style={{
                      background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                      border: "none",
                      borderRadius: "25px",
                      padding: "15px 50px",
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "16px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      width: "100%",
                      maxWidth: "400px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)"
                      e.target.style.boxShadow = `0 10px 25px rgba(139, 92, 246, 0.4)`
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    {loading ? (
                      <>
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            border: "2px solid transparent",
                            borderTop: "2px solid #fff",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCog size={18} />
                        Update Referral Settings
                      </>
                    )}
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ReferralReward
