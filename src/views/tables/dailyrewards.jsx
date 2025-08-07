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
} from "@coreui/react";
import { getData, postData } from "../../../src/apiConfigs/apiCalls";
import {
  GET_ALL_DAILY_REWARD,
  SET_DAILY_REWARD,
} from "../../../src/apiConfigs/endpoints";

const Dailyrewards = () => {
  const [rewards, setRewards] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState({
    rewardPoints: "",
    Status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const rewardsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1); // Add this line to initialize totalPages

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

  const fetchRewards = async () => {
    setLoading(true);
    try {
      console.log("Fetching rewards...");
      const response = await getData(GET_ALL_DAILY_REWARD);
      console.log("GET_ALL_DAILY_REWARD Response:", response);
      setRewards(response?.data || []);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const indexOfLastReward = currentPage * rewardsPerPage;
  const indexOfFirstReward = indexOfLastReward - rewardsPerPage;
  const currentRewards = rewards.slice(indexOfFirstReward, indexOfLastReward);

  const nextPage = () => {
    if (indexOfLastReward < rewards.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEditClick = (reward) => {
    console.log("Edit clicked for reward:", reward); // Debug log
    setSelectedReward({
      ...reward,
      rewardPoints: reward.points || reward.rewardPoints || "",
      Status: reward.status || reward.Status || "Active",
    });
    setShowModal(true);
    console.log("Modal should be visible now, showModal:", true); // Debug log
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedReward((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await postData(SET_DAILY_REWARD, selectedReward);
      setSuccess("Daily reward updated successfully!");
      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
        fetchRewards();
      }, 1500);
    } catch (error) {
      console.error("Error updating reward:", error);
      setError(error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCloseModal = () => {
    console.log("Closing modal"); // Debug log
    setShowModal(false);
    setSelectedReward({ rewardPoints: "", Status: "" });
  };

  // Dark theme loading state
  if (loading && rewards.length === 0) {
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
            Loading Rewards
          </h3>
          <p style={{ color: darkTheme.textSecondary }}>
            Fetching daily rewards data...
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
            <i
              className="fas fa-gift"
              style={{ color: "#fff", marginRight: "10px", fontSize: "24px" }}
            />
            <h5 style={{ color: "#fff", margin: 0, fontWeight: "600" }}>
              Daily Rewards
            </h5>
          </div>
        </CCardHeader>

        <CCardBody style={{ padding: "40px" }}>
          {/* Success/Error Messages */}
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

          <CRow>
            <div className="container">
              {/* Rewards Table */}
              <div
                style={{
                  background: darkTheme.bgSecondary,
                  borderRadius: "15px",
                  overflow: "hidden",
                  border: `1px solid ${darkTheme.border}`,
                }}
              >
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
                        }}
                      >
                        Points
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
                          colSpan="4"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: darkTheme.textSecondary,
                            border: "none",
                          }}
                        >
                          <div className="d-flex justify-content-center align-items-center">
                            <CSpinner
                              style={{
                                color: darkTheme.accent3,
                                marginRight: "10px",
                              }}
                            />
                            Loading rewards...
                          </div>
                        </td>
                      </tr>
                    ) : currentRewards.length > 0 ? (
                      currentRewards.map((reward, index) => (
                        <tr
                          key={reward._id}
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
                            }}
                          >
                            {indexOfFirstReward + index + 1}
                          </td>
                          <td
                            style={{
                              padding: "20px",
                              color: darkTheme.textPrimary,
                              fontWeight: "600",
                              border: "none",
                            }}
                          >
                            {reward.points || 0}
                          </td>
                          <td style={{ padding: "20px", border: "none" }}>
                            <span
                              style={{
                                background:
                                  reward.status === "Active" ||
                                  reward.status === "active"
                                    ? `${darkTheme.success}20`
                                    : `${darkTheme.danger}20`,
                                color:
                                  reward.status === "Active" ||
                                  reward.status === "active"
                                    ? darkTheme.success
                                    : darkTheme.danger,
                                padding: "6px 12px",
                                borderRadius: "15px",
                                fontSize: "12px",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                              }}
                            >
                              {reward.status || "N/A"}
                            </span>
                          </td>
                          <td style={{ padding: "20px", border: "none" }}>
                            <CButton
                              onClick={() => handleEditClick(reward)}
                              style={{
                                background: `linear-gradient(135deg, ${darkTheme.accent4}, rgb(139, 92, 246))`,
                                border: "none",
                                borderRadius: "10px",
                                padding: "8px 15px",
                                color: "#fff",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "scale(1.1)";
                                e.target.style.boxShadow = `0 5px 15px ${darkTheme.accent4}50`;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "scale(1)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              <i
                                className="fas fa-edit"
                                style={{ fontSize: "14px" }}
                              />
                            </CButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: darkTheme.textMuted,
                            fontWeight: "600",
                            border: "none",
                          }}
                        >
                          No rewards available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {rewards.length > 0 && (
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
                        color: currentPage === 1 ? darkTheme.textMuted : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      &#8249;
                    </button>

                    {/* Page Numbers */}
                    {(() => {
                      const pages = [];
                      const totalPages = Math.ceil(
                        rewards.length / rewardsPerPage
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
                        fontWeight: currentPage === pageNum ? "bold" : "normal",
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
                          for (let i = totalPages - 2; i <= totalPages; i++) {
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
                          currentPage >= totalPages ? "not-allowed" : "pointer",
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

      {/* Modal for Edit Reward */}
      <CModal
        visible={showModal}
        onClose={handleCloseModal}
        backdrop="static"
        size="lg"
      >
        <div
          style={{
            background: darkTheme.bgCard,
            border: `1px solid ${darkTheme.border}`,
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <CModalHeader
            style={{
              background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
              border: "none",
              padding: "25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h5 style={{ color: "#fff", fontWeight: "600", margin: 0 }}>
              <i
                className="fas fa-gift"
                style={{ marginRight: "10px", fontSize: "20px" }}
              />
              Edit Reward
            </h5>
            {/* <CButton
              onClick={handleCloseModal}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                padding: "0",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              ×
            </CButton> */}
          </CModalHeader>
          <CModalBody style={{ padding: "30px", background: darkTheme.bgCard }}>
            <CForm>
              <div className="mb-3">
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
                  Reward Points
                </label>
                <CFormInput
                  name="rewardPoints"
                  type="number"
                  value={selectedReward?.rewardPoints || ""}
                  onChange={handleChange}
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    borderRadius: "10px",
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
                />
              </div>
              <div className="mb-3">
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
                  Status
                </label>
                <CFormInput
                  name="Status"
                  value={selectedReward?.Status || "Active"}
                  onChange={handleChange}
                  style={{
                    background: darkTheme.bgSecondary,
                    border: `1px solid ${darkTheme.border}`,
                    borderRadius: "10px",
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
                />
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter
            style={{
              background: darkTheme.bgCard,
              border: "none",
              padding: "20px 30px",
            }}
          >
            <CButton
              onClick={handleCloseModal}
              style={{
                background: "transparent",
                border: `2px solid ${darkTheme.textMuted}`,
                borderRadius: "10px",
                padding: "10px 25px",
                color: darkTheme.textMuted,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Cancel
            </CButton>
            <CButton
              onClick={handleSave}
              disabled={saveLoading}
              style={{
                background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                border: "none",
                borderRadius: "10px",
                padding: "10px 25px",
                color: "#fff",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {saveLoading ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid transparent",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </CButton>
          </CModalFooter>
        </div>
      </CModal>

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

export default Dailyrewards;
