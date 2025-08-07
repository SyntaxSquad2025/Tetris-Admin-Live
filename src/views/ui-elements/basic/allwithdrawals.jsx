"use client"

import { useState, useEffect } from "react"
import { CRow, CCard, CCardHeader, CCardBody, CButton } from "@coreui/react"
import { getData } from "../../../apiConfigs/apiCalls"
import { GET_ALL_WITHDRAWALS } from "../../../apiConfigs/endpoints"
import * as XLSX from "xlsx"
import { useNavigate } from "react-router-dom"

const AllWithdrawals = () => {
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

  const [withdrawals, setWithdrawals] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const withdrawalsPerPage = 10

  const navigate = useNavigate()

  const fetchWithdrawals = async (page = 1) => {
    try {
      setLoading(true)
      // Use the backend's pagination parameters
      const response = await getData(`${GET_ALL_WITHDRAWALS}?page=${page}&limit=${withdrawalsPerPage}`)
      console.log("GET_ALL_WITHDRAWALS Response:", response)

      if (response?.withdrawals) {
        setWithdrawals(response.withdrawals)
        setTotalCount(response.count || 0)
        setTotalPages(response.totalPages || 1)
        setCurrentPage(page)
      } else {
        setWithdrawals([])
        setTotalCount(0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
      setWithdrawals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals(currentPage)
  }, [])

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      fetchWithdrawals(newPage)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      fetchWithdrawals(newPage)
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      fetchWithdrawals(page)
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return darkTheme.success
      case "pending":
        return darkTheme.warning
      case "rejected":
        return darkTheme.danger
      case "transferred":
        return darkTheme.info
      default:
        return "#6c757d" // secondary
    }
  }

  const getStatusBadgeBackground = (status) => {
    const color = getStatusBadge(status)
    return `${color}20` // 20% opacity
  }

  // Function to handle userId click - navigate to user details page using userId
  const handleUserIdClick = async (userId) => {
    if (!userId) {
      alert("User ID is required")
      return
    }

    try {
      // Store the userId in sessionStorage for the user details page
      sessionStorage.setItem("selectedUserId", userId)

      // Navigate directly to the user details page with the userId
      navigate(`/user-game-details/${encodeURIComponent(userId)}`)
    } catch (error) {
      console.error("Error navigating to user details:", error)
      alert("Error navigating to user details. Please try again.")
    }
  }

  // Download all withdrawals as Excel
  const downloadExcel = async () => {
    try {
      // Fetch all withdrawals with a high limit
      const response = await getData(`${GET_ALL_WITHDRAWALS}?page=1&limit=10000000000000000000000000000000000000000000`)
      const allWithdrawals = response?.withdrawals || []

      if (!allWithdrawals.length) {
        alert("No data to export")
        return
      }

      const formattedData = allWithdrawals.map((withdrawal, index) => ({
        UserId: withdrawal.userId || "N/A",
        UserName: withdrawal.userName || "N/A",
        Amount: withdrawal.amount || 0,
        // USDT_Amount: withdrawal.USDT_Amount || 0,
        "Created At": withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleString() : "N/A",
        "Updated At": withdrawal.updatedAt ? new Date(withdrawal.updatedAt).toLocaleString() : "N/A",
        Status: withdrawal.status || "N/A",
      }))

      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "AllWithdrawals")

      XLSX.writeFile(wb, "all_withdrawals.xlsx")
    } catch (error) {
      alert("Failed to export withdrawals. Please try again.")
      console.error("Error exporting withdrawals:", error)
    }
  }

  if (loading && withdrawals.length === 0) {
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
          <h3 style={{ color: darkTheme.textPrimary, fontWeight: "300", marginBottom: "10px" }}>Loading Withdrawals</h3>
          <p style={{ color: darkTheme.textSecondary }}>Fetching withdrawal data...</p>
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
              <h3 style={{ color: "#fff", margin: 0, fontWeight: "600" }}>All Withdrawals</h3>
            </CCardHeader>

            <CCardBody style={{ padding: "40px", background: darkTheme.bgCard }}>
              <div className="d-flex justify-content-end mb-3">
                <CButton
                  style={{
                    background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                    border: "none",
                    borderRadius: "15px",
                    padding: "12px 25px",
                    color: "#fff",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.3s ease",
                  }}
                  onClick={downloadExcel}
                >
                  EXPORT AS EXCEL
                </CButton>
              </div>

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
      User ID
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
      User Name
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
      Amount
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
      Updated At
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
  </tr>
</thead>
<tbody>
  {loading ? (
    <tr>
      <td
        colSpan="7"
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
          Loading withdrawals...
        </div>
      </td>
    </tr>
  ) : withdrawals.length > 0 ? (
    withdrawals.map((withdrawal, index) => (
      <tr
        key={withdrawal._id}
        style={{
          borderBottom: `1px solid ${darkTheme.border}`,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = darkTheme.bgCardHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
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
          {(currentPage - 1) * withdrawalsPerPage + index + 1}
        </td>
        <td
          style={{
            padding: "20px",
            color: darkTheme.accent3,
            fontWeight: "600",
            border: "none",
            textAlign: "center", // Centering the data
          }}
        >
          <span
            style={{
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() =>
              handleUserIdClick(withdrawal.userId || withdrawal._id)
            }
          >
            {withdrawal.userId || withdrawal._id || "N/A"}
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
          {withdrawal.userName || "N/A"}
        </td>
        <td style={{ padding: "20px", color: darkTheme.textPrimary, border: "none", textAlign: "center" }}>
          {withdrawal.amount || 0}
        </td>
        <td style={{ padding: "20px", color: darkTheme.textPrimary, border: "none", textAlign: "center" }}>
          {new Date(withdrawal.createdAt).toLocaleString() || "N/A"}
        </td>
        <td style={{ padding: "20px", color: darkTheme.textPrimary, border: "none", textAlign: "center" }}>
          {new Date(withdrawal.updatedAt).toLocaleString() || "N/A"}
        </td>
        <td style={{ padding: "20px", border: "none", textAlign: "center" }}>
          <span
            style={{
              background: getStatusBadgeBackground(withdrawal.status),
              color: getStatusBadge(withdrawal.status),
              padding: "6px 12px",
              borderRadius: "15px",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {withdrawal.status?.charAt(0).toUpperCase() +
              withdrawal.status?.slice(1) ||
              "N/A"}
          </span>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan="7"
        style={{
          textAlign: "center",
          padding: "40px",
          color: darkTheme.textMuted,
          fontWeight: "600",
          border: "none",
        }}
      >
        No withdrawals available
      </td>
    </tr>
  )}
</tbody>

                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {withdrawals.length > 0 && (
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
                          const pages = []

                          if (totalPages <= 7) {
                            // Show all pages if 7 or fewer
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(
                                <button
                                  key={i}
                                  onClick={() => goToPage(i)}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background:
                                      currentPage === i
                                        ? `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`
                                        : "transparent",
                                    color: currentPage === i ? "#fff" : darkTheme.textPrimary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontWeight: currentPage === i ? "bold" : "normal",
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  {i}
                                </button>,
                              )
                            }
                          } else {
                            // Complex pagination logic for many pages
                            if (currentPage <= 3) {
                              // Show first 3 pages, ellipsis, last page
                              for (let i = 1; i <= 3; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => goToPage(i)}
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "10px",
                                      border: "none",
                                      background:
                                        currentPage === i
                                          ? `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`
                                          : "transparent",
                                      color: currentPage === i ? "#fff" : darkTheme.textPrimary,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      fontWeight: currentPage === i ? "bold" : "normal",
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                                    {i}
                                  </button>,
                                )
                              }
                              if (totalPages > 4) {
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
                                  </span>,
                                )
                                pages.push(
                                  <button
                                    key={totalPages}
                                    onClick={() => goToPage(totalPages)}
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "10px",
                                      border: "none",
                                      background: "transparent",
                                      color: darkTheme.textPrimary,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                                    {totalPages}
                                  </button>,
                                )
                              }
                            } else if (currentPage >= totalPages - 2) {
                              // Show first page, ellipsis, last 3 pages
                              pages.push(
                                <button
                                  key={1}
                                  onClick={() => goToPage(1)}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "transparent",
                                    color: darkTheme.textPrimary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  1
                                </button>,
                              )
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
                                </span>,
                              )
                              for (let i = totalPages - 2; i <= totalPages; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => goToPage(i)}
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "10px",
                                      border: "none",
                                      background:
                                        currentPage === i
                                          ? `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`
                                          : "transparent",
                                      color: currentPage === i ? "#fff" : darkTheme.textPrimary,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      fontWeight: currentPage === i ? "bold" : "normal",
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                                    {i}
                                  </button>,
                                )
                              }
                            } else {
                              // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
                              pages.push(
                                <button
                                  key={1}
                                  onClick={() => goToPage(1)}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "transparent",
                                    color: darkTheme.textPrimary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  1
                                </button>,
                              )
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
                                </span>,
                              )
                              for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => goToPage(i)}
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "10px",
                                      border: "none",
                                      background:
                                        currentPage === i
                                          ? `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`
                                          : "transparent",
                                      color: currentPage === i ? "#fff" : darkTheme.textPrimary,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      fontWeight: currentPage === i ? "bold" : "normal",
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                                    {i}
                                  </button>,
                                )
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
                                </span>,
                              )
                              pages.push(
                                <button
                                  key={totalPages}
                                  onClick={() => goToPage(totalPages)}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "transparent",
                                    color: darkTheme.textPrimary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  {totalPages}
                                </button>,
                              )
                            }
                          }

                          return pages
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
                            color: currentPage >= totalPages ? darkTheme.textMuted : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
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
  )
}

export default AllWithdrawals
