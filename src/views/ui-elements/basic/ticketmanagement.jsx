"use client";

import { useState, useEffect } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CContainer,
  CAlert,
  CSpinner,
  CFormSelect,
} from "@coreui/react";
import { FaDiamond, FaTicket, FaWallet } from "react-icons/fa6";
import { getData, postData } from "../../../apiConfigs/apiCalls";
import { GET_TICKET, UPDATE_TICKET } from "../../../apiConfigs/endpoints";

const TicketManagement = () => {
  const [ticketSettings, setTicketSettings] = useState({
    ticketId: "",
    ticketQuantity: "",
    amountInToken: "",
    defaultAdminWallet: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

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
    accent3: "rgb(139, 92, 246)", // Purple color
    shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
    border: "rgba(255, 255, 255, 0.1)",
    success: "#28a745",
    danger: "#dc3545",
  };

  // Fetch ticket settings on mount
  const fetchTicketSettings = async () => {
    setFetchLoading(true);
    try {
      const response = await getData(GET_TICKET);
      console.log("Fetched ticket data:", response);

      if (response?.success && response?.data) {
        setTicketSettings({
          ticketId: response.data._id || "",
          ticketQuantity: response.data.ticketQuantity || "",
          amountInToken: response.data.amountInToken || "",
          defaultAdminWallet: response.data.defaultAdminWallet || "",
          status: response.data.status || "ACTIVE",
        });
      }
    } catch (error) {
      console.error("Error fetching ticket settings:", error);
      setMessage({
        text: "Failed to load ticket settings. Please try again.",
        type: "danger",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketSettings();
  }, []);

const handleChange = (e) => {
  const { name, value } = e.target;
  setTicketSettings((prev) => {
    const updatedSettings = { ...prev, [name]: value };
    console.log(updatedSettings); // Debugging the state update
    return updatedSettings;
  });
};


  const clearMessage = () => {
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Save ticket conversion settings
  const handleSaveTicketSettings = async () => {
    // Validation
    if (!ticketSettings.ticketQuantity || !ticketSettings.amountInToken) {
      setMessage({
        text: "Please fill in all required fields (Ticket Quantity and Amount in Token)",
        type: "danger",
      });
      clearMessage();
      return;
    }

    if (!ticketSettings.defaultAdminWallet) {
      setMessage({
        text: "Please provide a default admin wallet address",
        type: "danger",
      });
      clearMessage();
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        ticketQuantity: Number(ticketSettings.ticketQuantity),
        amountInToken: Number(ticketSettings.amountInToken),
        defaultAdminWallet: ticketSettings.defaultAdminWallet,
        status: ticketSettings.status,
      };

      // If we have a TicketId, include it for update
      if (ticketSettings.ticketId) {
        requestBody.ticketId = ticketSettings._id || ticketSettings.ticketId;
      }

      console.log("Sending request:", requestBody);

      const response = await postData(UPDATE_TICKET, requestBody);
      console.log("Response:", response);

      if (response?.success) {
        setMessage({
          text: `Ticket conversion settings ${ticketSettings._id || ticketSettings.ticketId ? "updated" : "created"} successfully!`,
          type: "success",
        });

        // Update the TicketId if it was a new creation
        if (
          (!ticketSettings.ticketId && response.data?._id) ||
          response.data?.ticketId
        ) {
          setTicketSettings((prev) => ({
            ...prev,
            TicketId: response.data._id || response.data.ticketId,
          }));
        }
      } else {
        throw new Error(response?.message || "Failed to save ticket settings");
      }
    } catch (error) {
      console.error("Error saving ticket settings:", error);
      setMessage({
        text: error.message || "Failed to save ticket settings",
        type: "danger",
      });
    } finally {
      setLoading(false);
      clearMessage();
    }
  };

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
              <div className="text-center my-5">
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
                <h3
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "300",
                    marginBottom: "10px",
                  }}
                >
                  Loading ticket settings...
                </h3>
                <p style={{ color: darkTheme.textSecondary }}>
                  Fetching ticket data...
                </p>
              </div>
            </CCol>
          </CRow>
        </CContainer>

        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
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
              className="mb-4 shadow-lg"
              style={{
                borderRadius: "25px",
                background: darkTheme.bgCard,
                border: `1px solid ${darkTheme.border}`,
                boxShadow: darkTheme.shadow,
              }}
            >
              <CCardHeader
                style={{
                  background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                  color: "white",
                  borderTopLeftRadius: "25px",
                  borderTopRightRadius: "25px",
                  border: "none",
                }}
                className="text-center"
              >
                <h5 className="fw-bold">Ticket Conversion Management</h5>
              </CCardHeader>
              <CCardBody
                className="p-4"
                style={{ background: darkTheme.bgCard }}
              >
                {message.text && (
                  <CAlert
                    color={message.type}
                    dismissible
                    onClose={() => setMessage({ text: "", type: "" })}
                    style={{
                      background:
                        message.type === "success"
                          ? `${darkTheme.success}20`
                          : `${darkTheme.danger}20`,
                      border: `1px solid ${message.type === "success" ? darkTheme.success : darkTheme.danger}`,
                      borderRadius: "15px",
                      color:
                        message.type === "success"
                          ? darkTheme.success
                          : darkTheme.danger,
                    }}
                  >
                    {message.text}
                  </CAlert>
                )}

                <div className="mb-4">
                  <CFormLabel
                    style={{
                      color: darkTheme.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    Ticket Quantity
                  </CFormLabel>
                  <div className="position-relative">
                    <CFormInput
                      type="number"
                      name="ticketQuantity"
                      value={ticketSettings.ticketQuantity}
                      onChange={handleChange}
                      placeholder="Enter ticket quantity"
                      disabled={false}
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "12px 50px 12px 15px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = darkTheme.accent3;
                        e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.2)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkTheme.border;
                        e.target.style.boxShadow = "none";
                      }}
                      required
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: darkTheme.accent3,
                      }}
                    >
                      <FaTicket size={20} />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <CFormLabel
                    style={{
                      color: darkTheme.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    Amount in Token
                  </CFormLabel>
                  <div className="position-relative">
                    <CFormInput
                      type="number"
                      step="0.000001"
                      name="amountInToken"
                      value={ticketSettings.amountInToken}
                      onChange={handleChange}
                      placeholder="Enter token amount"
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "12px 50px 12px 15px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = darkTheme.accent3;
                        e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.2)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkTheme.border;
                        e.target.style.boxShadow = "none";
                      }}
                      required
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: darkTheme.accent3,
                      }}
                    >
                      <FaDiamond size={20} />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <CFormLabel
                    style={{
                      color: darkTheme.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    Admin Wallet
                  </CFormLabel>
                  <div className="position-relative">
                    <CFormInput
                      type="text"
                      name="defaultAdminWallet"
                      value={ticketSettings.defaultAdminWallet}
                      onChange={handleChange}
                      placeholder="Enter admin wallet address"
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "12px 50px 12px 15px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = darkTheme.accent3;
                        e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.2)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkTheme.border;
                        e.target.style.boxShadow = "none";
                      }}
                      required
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: darkTheme.accent3,
                      }}
                    >
                      <FaWallet size={20} />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <CFormLabel
                    style={{
                      color: darkTheme.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    Status
                  </CFormLabel>
                  <CFormSelect
                    name="status"
                    value={ticketSettings.status}
                    onChange={handleChange}
                    style={{
                      background: darkTheme.bgSecondary,
                      border: `1px solid ${darkTheme.border}`,
                      borderRadius: "15px",
                      color: darkTheme.textPrimary,
                      padding: "12px 15px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = darkTheme.accent3;
                      e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.2)`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = darkTheme.border;
                      e.target.style.boxShadow = "none";
                    }}
                    options={[
                      { label: "ACTIVE", value: "ACTIVE" },
                      { label: "INACTIVE", value: "INACTIVE" },
                    ]}
                  />
                </div>

                <div className="d-flex justify-content-center mt-4">
                  <CButton
                    onClick={handleSaveTicketSettings}
                    disabled={loading}
                    style={{
                      background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                      borderColor: "transparent",
                      color: "white",
                      borderRadius: "25px",
                      padding: "12px 40px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.05)";
                      e.target.style.boxShadow =
                        "0 10px 30px rgba(139, 92, 246, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    {loading ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : ticketSettings._id || ticketSettings.ticketId ? (
                      "Update Settings"
                    ) : (
                      "Create Settings"
                    )}
                  </CButton>
                </div>

                {ticketSettings.ticketId && (
                  <div className="text-center mt-3">
                    {/* <small className="text-muted">Current Settings ID: {ticketSettings.TicketId}</small> */}
                  </div>
                )}
              </CCardBody>
            </CCard>

            {/* Information Card */}
            <CCard
              className="mb-4 shadow-lg"
              style={{
                borderRadius: "25px",
                background: darkTheme.bgCard,
                border: `1px solid ${darkTheme.border}`,
                boxShadow: darkTheme.shadow,
              }}
            >
              <CCardHeader
                style={{
                  background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                  color: "white",
                  borderTopLeftRadius: "25px",
                  borderTopRightRadius: "25px",
                  border: "none",
                }}
                className="text-center"
              >
                <h6 className="fw-bold mb-0">Conversion Rate Information</h6>
              </CCardHeader>
              <CCardBody
                className="p-4"
                style={{ background: darkTheme.bgCard }}
              >
                <div className="row text-center">
                  <div className="col-md-6">
                    <div
                      className="p-3 rounded"
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = darkTheme.accent3;
                        e.target.style.boxShadow = `0 5px 20px rgba(139, 92, 246, 0.2)`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = darkTheme.border;
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <h6
                        className="mb-1"
                        style={{ color: darkTheme.textSecondary }}
                      >
                        Tickets
                      </h6>
                      <h4 className="mb-0" style={{ color: darkTheme.accent3 }}>
                        {ticketSettings.ticketQuantity || "0"}
                      </h4>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3 rounded"
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = darkTheme.success;
                        e.target.style.boxShadow = `0 5px 20px rgba(40, 167, 69, 0.2)`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = darkTheme.border;
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <h6
                        className="mb-1"
                        style={{ color: darkTheme.textSecondary }}
                      >
                        Token Amount
                      </h6>
                      <h4 className="mb-0" style={{ color: darkTheme.success }}>
                        {ticketSettings.amountInToken || "0"}
                      </h4>
                    </div>
                  </div>
                </div>
                {ticketSettings.ticketQuantity &&
                  ticketSettings.amountInToken && (
                    <div className="text-center mt-3">
                      <small style={{ color: darkTheme.textSecondary }}>
                        Rate: 1 Token ={" "}
                        <span
                          style={{
                            color: darkTheme.accent3,
                            fontWeight: "600",
                          }}
                        >
                          {(
                            Number(ticketSettings.ticketQuantity) /
                            Number(ticketSettings.amountInToken)
                          ).toFixed(6)}
                        </span>{" "}
                        Tickets
                      </small>
                    </div>
                  )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

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
};

export default TicketManagement;
