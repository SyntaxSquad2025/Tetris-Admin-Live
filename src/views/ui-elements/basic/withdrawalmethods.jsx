"use client";

import { useState, useEffect } from "react";
import {
  CRow,
  CCard,
  CCardHeader,
  CCardBody,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CButton,
  CAlert,
  CSpinner,
  CFormSelect,
  CFormTextarea,
} from "@coreui/react";
import { getData, postData } from "../../../apiConfigs/apiCalls";
import {
  GET_WITHDRAWAL_LIMITS,
  CREATE_WITHDRAW_LIMITS,
  UPDATE_WITHDRAW_LIMITS,
} from "../../../apiConfigs/endpoints";

const WithdrawalMethods = () => {
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
    accent4: "rgb(139, 92, 246)",
    accent5: "#6c5ce7",
    shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
    shadowHover: "0 20px 40px 0 rgba(0, 0, 0, 0.7)",
    border: "rgba(255, 255, 255, 0.1)",
    borderHover: "rgba(255, 255, 255, 0.2)",
    success: "#28a745",
    danger: "#dc3545",
  };

  const [methods, setMethods] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const methodsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1); // Add this line to initialize totalPages

  // Fetch withdrawal methods from API
  const fetchMethods = async () => {
    setLoading(true);
    try {
      const response = await getData(GET_WITHDRAWAL_LIMITS);
      console.log("API Response:", response);

      // Ensure methods is always an array
      let methodsData = [];
      if (response?.data && Array.isArray(response.data)) {
        methodsData = response.data;
      } else if (response?.data) {
        methodsData = [response.data];
      } else if (Array.isArray(response)) {
        methodsData = response;
      }

      setMethods(methodsData);
      setError(null);
    } catch (error) {
      console.error("Fetch methods error:", error);
      setError("Failed to load withdrawal methods. Please try again.");
      setMethods([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  // Ensure methods is an array before slicing
  const safeMethodsArray = Array.isArray(methods) ? methods : [];
  const indexOfLastMethod = currentPage * methodsPerPage;
  const indexOfFirstMethod = indexOfLastMethod - methodsPerPage;
  const currentMethods = safeMethodsArray.slice(
    indexOfFirstMethod,
    indexOfLastMethod
  );

  const nextPage = () => {
    if (indexOfLastMethod < methods.length) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleAdd = () => {
    setSelectedMethod({
      token_Mint: "",
      symbol: "",
      minWithdrawal: 0,
      maxWithdrawal: 0,
      fixed_Charge: 0,
      percentage_Charge: 0,
      fee_Wallet: "",
      withdraw_Note: "",
      withdrawallimits: 0,
      status: "ACTIVE",
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleEditClick = (method) => {
    setSelectedMethod({ ...method });
    setIsEditing(true);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedMethod((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userId = localStorage.getItem("id");
      if (!userId) throw new Error("User ID not found. Please log in again.");

      const requestBody = {
        token_Mint: selectedMethod.token_Mint,
        symbol: selectedMethod.symbol,
        minWithdrawal: Number(selectedMethod.minWithdrawal),
        maxWithdrawal: Number(selectedMethod.maxWithdrawal),
        fixed_Charge: Number(selectedMethod.fixed_Charge),
        percentage_Charge: Number(selectedMethod.percentage_Charge),
        fee_Wallet: selectedMethod.fee_Wallet,
        withdraw_Note: selectedMethod.withdraw_Note,
        withdrawalCount: Number(selectedMethod.withdrawalCount), // Ensure correct key here
        status: selectedMethod.status,
        addedBy: userId,
      };

      let response;
      if (isEditing) {
        requestBody.id = selectedMethod._id;
        response = await postData(UPDATE_WITHDRAW_LIMITS, requestBody);
      } else {
        response = await postData(CREATE_WITHDRAW_LIMITS, requestBody);
      }

      if (response && response.success) {
        setSuccess(
          `Withdrawal method ${isEditing ? "updated" : "added"} successfully!`
        );
        setTimeout(() => {
          setShowModal(false);
          setSuccess(null);
          fetchMethods();
        }, 1500);
      } else {
        throw new Error("Failed to save withdrawal method");
      }
    } catch (error) {
      console.error("Save error:", error);
      setError(
        `Failed to ${isEditing ? "update" : "add"} method: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && methods.length === 0) {
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
          <h3
            style={{
              color: darkTheme.textPrimary,
              fontWeight: "300",
              marginBottom: "10px",
            }}
          >
            Loading Methods
          </h3>
          <p style={{ color: darkTheme.textSecondary }}>
            Fetching withdrawal methods...
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

      <CRow className="justify-content-center">
        <div className="col-xl-12">
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
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                border: "none",
              }}
            >
              <h3 style={{ color: "#fff", margin: 0, fontWeight: "600" }}>
                Withdrawal Methods
              </h3>
              <CButton
                style={{
                  background: "#fff",
                  border: "none",
                  borderRadius: "15px",
                  padding: "12px 25px",
                  color: darkTheme.accent3,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                onClick={handleAdd}
              >
                + Add Method
              </CButton>
            </CCardHeader>

            <CCardBody
              style={{ padding: "40px", background: darkTheme.bgCard }}
            >
              {error && (
                <CAlert
                  style={{
                    background: `${darkTheme.danger}20`,
                    border: `1px solid ${darkTheme.danger}`,
                    borderRadius: "15px",
                    color: darkTheme.danger,
                    marginBottom: "20px",
                  }}
                  dismissible
                  onClose={() => setError(null)}
                >
                  <i className="fas fa-exclamation-triangle me-2" />
                  {error}
                </CAlert>
              )}

              {success && (
                <CAlert
                  style={{
                    background: `${darkTheme.success}20`,
                    border: `1px solid ${darkTheme.success}`,
                    borderRadius: "15px",
                    color: darkTheme.success,
                    marginBottom: "20px",
                  }}
                  dismissible
                  onClose={() => setSuccess(null)}
                >
                  <i className="fas fa-check-circle me-2" />
                  {success}
                </CAlert>
              )}

              {loading && !showModal && (
                <div className="text-center my-3">
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: `3px solid ${darkTheme.bgTertiary}`,
                      borderTop: `3px solid ${darkTheme.accent3}`,
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 15px",
                    }}
                  />
                  <p style={{ color: darkTheme.textSecondary }}>
                    Loading withdrawal methods...
                  </p>
                </div>
              )}

              <CRow>
                <div className="container">
                  <div
                    style={{
                      background: darkTheme.bgSecondary,
                      borderRadius: "15px",
                      overflow: "hidden",
                      border: `1px solid ${darkTheme.border}`,
                    }}
                  >
                    <div className="table-responsive">
                      <table
                        className="table"
                        style={{
                          margin: 0,
                          color: darkTheme.textPrimary,
                        }}
                      >
                        <thead
                          style={{
                            background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                          }}
                        >
                          <tr>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              S.No
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Token Mint
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Symbol
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Created At
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Min Withdrawal
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Max Withdrawal
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Fixed Charge
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Percentage Charge
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Fee Wallet
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Withdraw Note
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Withdrawal Limits
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Status
                            </th>
                            <th
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "20px",
                                fontSize: "14px",
                                border: "none",
                                textAlign: "center", // Centering the header text
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td
                                colSpan="13"
                                style={{
                                  textAlign: "center",
                                  padding: "40px",
                                  color: darkTheme.textSecondary,
                                  border: "none",
                                }}
                              >
                                <div className="d-flex justify-content-center align-items-center">
                                  <div
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      border: `3px solid ${darkTheme.bgTertiary}`,
                                      borderTop: `3px solid ${darkTheme.accent3}`,
                                      borderRadius: "50%",
                                      animation: "spin 1s linear infinite",
                                      marginRight: "10px",
                                    }}
                                  />
                                  Loading methods...
                                </div>
                              </td>
                            </tr>
                          ) : currentMethods.length > 0 ? (
                            currentMethods.map((method, index) => (
                              <tr
                                key={method._id}
                                style={{
                                  borderBottom: `1px solid ${darkTheme.border}`,
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    darkTheme.bgCardHover;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }}
                              >
                                <td
                                  style={{
                                    padding: "20px",
                                    fontWeight: "600",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center", // Centering the data
                                  }}
                                >
                                  {indexOfFirstMethod + index + 1}
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  <span title={method.Token_Mint}>
                                    {method.token_Mint || "N/A"}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    fontWeight: "600",
                                    border: "none",
                                    textAlign: "center", // Centering the data
                                  }}
                                >
                                  {method.symbol || "N/A"}
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  {method.createdAt
                                    ? new Date(
                                        method.createdAt
                                      ).toLocaleString()
                                    : "N/A"}
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  {method.minWithdrawal ?? 0}
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  {method.maxWithdrawal ?? 0}
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  {method.fixed_Charge ?? 0}
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  {method.percentage_Charge ?? 0}%
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  <span title={method.Fee_wallet}>
                                    {method.fee_Wallet || "N/A"}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  <span title={method.Withdraw_Note}>
                                    {method.withdraw_Note || "N/A"}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    color: darkTheme.textPrimary,
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  {method.withdrawalCount ?? 0}
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  <span
                                    style={{
                                      background:
                                        method.status === "ACTIVE"
                                          ? `${darkTheme.success}20`
                                          : `${darkTheme.textMuted}20`,
                                      color:
                                        method.status === "ACTIVE"
                                          ? darkTheme.success
                                          : darkTheme.textMuted,
                                      padding: "6px 12px",
                                      borderRadius: "15px",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      textTransform: "uppercase",
                                      letterSpacing: "1px",
                                    }}
                                  >
                                    {method.status}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "20px",
                                    border: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  <button
                                    onClick={() => handleEditClick(method)}
                                    style={{
                                      background: `linear-gradient(135deg, ${darkTheme.accent4}, rgb(139, 92, 246))`,
                                      border: "none",
                                      borderRadius: "10px",
                                      padding: "8px 15px",
                                      color: "#fff",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = "scale(1.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = "scale(1)";
                                    }}
                                  >
                                    <i className="fas fa-edit" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="13"
                                style={{
                                  textAlign: "center",
                                  padding: "40px",
                                  color: darkTheme.textMuted,
                                  fontWeight: "600",
                                  border: "none",
                                }}
                              >
                                No withdrawal methods available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {safeMethodsArray.length > 0 && (
                    <div className="d-flex justify-content-center mt-4">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: darkTheme.bgSecondary,
                          padding: "15px",
                          borderRadius: "15px",
                          border: `1px solid ${darkTheme.border}`,
                        }}
                      >
                        {/* Previous Button */}
                        <button
                          disabled={currentPage === 1}
                          onClick={prevPage}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            border: "none",
                            background:
                              currentPage === 1
                                ? darkTheme.bgTertiary
                                : `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                            color:
                              currentPage === 1 ? darkTheme.textMuted : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor:
                              currentPage === 1 ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                          }}
                        >
                          &#8249;
                        </button>

                        {/* Page Numbers */}
                        {(() => {
                          const pages = [];
                          const totalPages = Math.ceil(
                            safeMethodsArray.length / methodsPerPage
                          );

                          const getButtonStyle = (pageNum) => ({
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            border: "none",
                            background:
                              currentPage === pageNum
                                ? `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`
                                : "transparent",
                            color:
                              currentPage === pageNum
                                ? "#fff"
                                : darkTheme.textPrimary,
                            fontWeight:
                              currentPage === pageNum ? "bold" : "normal",
                            transition: "all 0.3s ease",
                          });

                          const renderPageButton = (i) => (
                            <button
                              key={i}
                              style={getButtonStyle(i)}
                              onClick={() => goToPage(i)}
                            >
                              {i}
                            </button>
                          );

                          if (totalPages <= 7) {
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(renderPageButton(i));
                            }
                          } else {
                            if (currentPage <= 3) {
                              for (let i = 1; i <= 3; i++) {
                                pages.push(renderPageButton(i));
                              }
                              pages.push(
                                <span
                                  key="ellipsis1"
                                  style={{
                                    color: darkTheme.textMuted,
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 10px",
                                  }}
                                >
                                  ...
                                </span>
                              );
                              pages.push(renderPageButton(totalPages));
                            } else if (currentPage >= totalPages - 2) {
                              pages.push(renderPageButton(1));
                              pages.push(
                                <span
                                  key="ellipsis2"
                                  style={{
                                    color: darkTheme.textMuted,
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 10px",
                                  }}
                                >
                                  ...
                                </span>
                              );
                              for (
                                let i = totalPages - 2;
                                i <= totalPages;
                                i++
                              ) {
                                pages.push(renderPageButton(i));
                              }
                            } else {
                              pages.push(renderPageButton(1));
                              pages.push(
                                <span
                                  key="ellipsis3"
                                  style={{
                                    color: darkTheme.textMuted,
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 10px",
                                  }}
                                >
                                  ...
                                </span>
                              );
                              for (
                                let i = currentPage - 1;
                                i <= currentPage + 1;
                                i++
                              ) {
                                pages.push(renderPageButton(i));
                              }
                              pages.push(
                                <span
                                  key="ellipsis4"
                                  style={{
                                    color: darkTheme.textMuted,
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 10px",
                                  }}
                                >
                                  ...
                                </span>
                              );
                              pages.push(renderPageButton(totalPages));
                            }
                          }

                          return pages;
                        })()}

                        {/* Next Button */}
                        <button
                          disabled={currentPage >= totalPages}
                          onClick={nextPage}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            border: "none",
                            background:
                              currentPage >= totalPages
                                ? darkTheme.bgTertiary
                                : `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                            color:
                              currentPage >= totalPages
                                ? darkTheme.textMuted
                                : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor:
                              currentPage >= totalPages
                                ? "not-allowed"
                                : "pointer",
                            transition: "all 0.3s ease",
                          }}
                        >
                          &#8250;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CRow>
            </CCardBody>
          </CCard>
        </div>
      </CRow>

      {/* Add/Edit Modal */}
      <CModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        alignment="center"
        backdrop="static"
        size="lg"
      >
        <CModalHeader
          closeButton
          style={{
            background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
            color: "white",
            border: "none",
          }}
        >
          <h5 className="m-0">
            {isEditing ? "Edit Withdrawal Method" : "Add Withdrawal Method"}
          </h5>
        </CModalHeader>
        <CModalBody
          style={{
            background: darkTheme.bgCard,
            color: darkTheme.textPrimary,
            padding: "25px",
          }}
        >
          {error && (
            <CAlert
              style={{
                background: `${darkTheme.danger}20`,
                border: `1px solid ${darkTheme.danger}`,
                borderRadius: "15px",
                color: darkTheme.danger,
                marginBottom: "20px",
              }}
              dismissible
              onClose={() => setError(null)}
            >
              <i className="fas fa-exclamation-triangle me-2" />
              {error}
            </CAlert>
          )}

          {success && (
            <CAlert
              style={{
                background: `${darkTheme.success}20`,
                border: `1px solid ${darkTheme.success}`,
                borderRadius: "15px",
                color: darkTheme.success,
                marginBottom: "20px",
              }}
              dismissible
              onClose={() => setSuccess(null)}
            >
              <i className="fas fa-check-circle me-2" />
              {success}
            </CAlert>
          )}

          <CForm>
            <div className="row mb-3">
              <div className="col-md-6">
                <label
                  htmlFor="token_Mint"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Token Mint Address
                </label>
                <CFormInput
                  type="text"
                  id="token_Mint"
                  name="token_Mint"
                  value={selectedMethod.token_Mint || ""}
                  onChange={handleChange}
                  placeholder="Enter token mint address"
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                />
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="symbol"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Symbol
                </label>
                <CFormInput
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={selectedMethod.symbol || ""}
                  onChange={handleChange}
                  placeholder="Enter token symbol"
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label
                  htmlFor="minWithdrawal"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Minimum Withdrawal
                </label>
                <CFormInput
                  type="number"
                  id="minWithdrawal"
                  name="minWithdrawal"
                  value={selectedMethod.minWithdrawal || 0}
                  onChange={handleChange}
                  placeholder="Enter minimum withdrawal amount"
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                />
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="maxWithdrawal"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Maximum Withdrawal
                </label>
                <CFormInput
                  type="number"
                  id="maxWithdrawal"
                  name="maxWithdrawal"
                  value={selectedMethod.maxWithdrawal || 0}
                  onChange={handleChange}
                  placeholder="Enter maximum withdrawal amount"
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label
                  htmlFor="fixed_Charge"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Fixed Charge
                </label>
                <CFormInput
                  type="number"
                  id="fixed_Charge"
                  name="fixed_Charge"
                  value={selectedMethod.fixed_Charge || 0}
                  onChange={handleChange}
                  placeholder="Enter fixed charge amount"
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                />
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="percentage_Charge"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Percentage Charge
                </label>
                <CFormInput
                  type="number"
                  id="percentage_Charge"
                  name="percentage_Charge"
                  value={selectedMethod.percentage_Charge || 0}
                  onChange={handleChange}
                  placeholder="Enter percentage charge"
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label
                  htmlFor="fee_Wallet"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Fee Wallet
                </label>
                <CFormInput
                  type="text"
                  id="fee_Wallet"
                  name="fee_Wallet"
                  value={selectedMethod.fee_Wallet || ""}
                  onChange={handleChange}
                  placeholder="Enter fee wallet address"
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                />
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="withdrawalCount"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Withdrawal Limits
                </label>
                <CFormInput
                  type="number"
                  id="withdrawalCount"
                  name="withdrawalCount"
                  value={selectedMethod.withdrawalCount || 0}
                  onChange={handleChange}
                  placeholder="Enter withdrawal limits"
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label
                  htmlFor="status"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Status
                </label>
                <CFormSelect
                  id="status"
                  name="status"
                  value={selectedMethod.status || "ACTIVE"}
                  onChange={handleChange}
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </CFormSelect>
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="Withdraw_Note"
                  style={{
                    color: darkTheme.textPrimary,
                    fontWeight: "600",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Withdrawal Note
                </label>
                <CFormTextarea
                  id="Withdraw_Note"
                  name="Withdraw_Note"
                  value={selectedMethod.Withdraw_Note || ""}
                  onChange={handleChange}
                  placeholder="Enter withdrawal note"
                  rows={3}
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    color: darkTheme.textPrimary,
                    borderRadius: "10px",
                    padding: "12px 15px",
                  }}
                />
              </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter
          style={{
            background: darkTheme.bgCard,
            border: "none",
            padding: "20px 25px",
          }}
        >
          <CButton
            style={{
              background: darkTheme.bgTertiary,
              border: `1px solid ${darkTheme.border}`,
              color: darkTheme.textPrimary,
              borderRadius: "10px",
              padding: "10px 20px",
              transition: "all 0.3s ease",
            }}
            onClick={() => setShowModal(false)}
          >
            Cancel
          </CButton>
          <CButton
            style={{
              background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              color: "#fff",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* CSS animations */}
  <style jsx>{`
        .table-row-hover:hover {
          background-color: #2d2d2d !important;
          transition: all 0.2s ease;
        }
        
        .form-select option {
          background-color: #2d2d2d;
          color: white;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }

        /* Custom scrollbar for the table */
        div::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }

        div::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb {
          background: #8b5cf6;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .col-12.col-md-6.col-lg-3,
          .col-12.col-md-6.col-lg-2,
          .col-12.col-lg-3 {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default WithdrawalMethods;
