"use client";

import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Modal,
  Table,
} from "react-bootstrap";
import {
  FaUsers,
  FaSearch,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaFileExcel,
} from "react-icons/fa";
import { getData } from "../../../apiConfigs/apiCalls";
import { useNavigate } from "react-router-dom";
import { GET_ALL_USERS } from "../../../apiConfigs/endpoints";
import * as XLSX from "xlsx";

const Usermanagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const usersPerPage = 10;

  const navigate = useNavigate();

  // Dark theme colors (matching profile page)
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
    accent2: "#7c3aed",
    accent3: "rgb(139, 92, 246)", // Purple color
    accent4: "#7c3aed",
    accent5: "#6c5ce7",
    shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
    shadowHover: "0 20px 40px 0 rgba(0, 0, 0, 0.7)",
    border: "rgba(255, 255, 255, 0.1)",
    borderHover: "rgba(255, 255, 255, 0.2)",
    success: "#28a745",
    danger: "#dc3545",
  };

  // Function to handle username click - navigate to user details page using userId
  const handleUsernameClick = async (username, userId) => {
    if (!userId) {
      alert("User ID is required");
      return;
    }

    try {
      // Store the userId in sessionStorage for the user details page
      sessionStorage.setItem("selectedUserId", userId);
      sessionStorage.setItem("selectedUsername", username); // Keep username for display purposes

      // Navigate directly to the user details page with the userId
      navigate(`/user-game-details/${encodeURIComponent(userId)}`);
    } catch (error) {
      console.error("Error navigating to user details:", error);
      alert("Error navigating to user details. Please try again.");
    }
  };

  // Fetch users with backend pagination
const fetchUsers = async (page = 1, limit = usersPerPage, name = "") => {
  try {
    setIsLoading(true);

    const query = new URLSearchParams({
      page,
      limit,
      ...(name && { userName: name }), // add search term if exists
    }).toString();

    const response = await getData(`${GET_ALL_USERS}?${query}`);
    console.log("GET_ALL_USERS Response:", response);

    if (response?.users) {
      setUsers(response.users);
      setTotalPages(response.totalPages || 1);
      setTotalUsers(response.count || 0);
      setCurrentPage(response.page || 1);
    } else {
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    setUsers([]);
    setTotalPages(1);
    setTotalUsers(0);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchUsers(1, usersPerPage, searchTerm); // Pass searchTerm to backend
  }, 400); // 400ms debounce

  return () => clearTimeout(delayDebounce);
}, [searchTerm]);


  // Initial fetch
  useEffect(() => {
    fetchUsers(1, usersPerPage);
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        // Filter users on frontend for search
        const filtered = users.filter((user) =>
          user.userName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Note: For better performance, you might want to implement backend search
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, users]);

  // Filtered users based on search term (client-side filtering)
const filteredUsers = users;

  // Pagination handlers
  const nextPage = () => {
  if (currentPage < totalPages) {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    fetchUsers(newPage, usersPerPage, searchTerm);
  }
};

const prevPage = () => {
  if (currentPage > 1) {
    const newPage = currentPage - 1;
    setCurrentPage(newPage);
    fetchUsers(newPage, usersPerPage, searchTerm);
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages && page !== currentPage) {
    setCurrentPage(page);
    fetchUsers(page, usersPerPage, searchTerm);
  }
};

  const openModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  // Function to download the users data as an Excel file
  const downloadExcel = async () => {
    setIsExporting(true);
    try {
      // Fetch all users for export (you might want to create a separate endpoint for this)
      let allUsers = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getData(
          `${GET_ALL_USERS}?page=${page}&limit=100`
        );
        if (response?.users && response.users.length > 0) {
          allUsers = [...allUsers, ...response.users];
          page++;
          hasMore = page <= response.totalPages;
        } else {
          hasMore = false;
        }
      }

      const formattedData = allUsers.map((user, index) => ({
        UserName: user.userName || "N/A",
        UserPoints: user.ticketBalance || 0,
        Email: user.email || "N/A",
        LoginType: user.loginType || "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, "users_data.xlsx");
    } catch (error) {
      console.error("Error exporting users to Excel:", error);
      alert("Failed to export users. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Dark theme loading state
  if (isLoading && users.length === 0) {
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
            Loading Users
          </h3>
          <p style={{ color: darkTheme.textSecondary }}>
            Fetching user data...
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

      <Row className="justify-content-center">
        <Col xl={12}>
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
                background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                padding: "25px",
                textAlign: "center",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaUsers size={24} style={{ color: "#fff" }} />
              <h3 style={{ color: "#fff", margin: 0, fontWeight: "600" }}>
                User Management
              </h3>
            </div>

            <Card.Body style={{ padding: "40px" }}>
              {/* Search Bar and Export Button */}
              <Row className="mb-4 align-items-center">
                <Col md={8}>
                  <div style={{ position: "relative" }}>
                    <FaSearch
                      style={{
                        position: "absolute",
                        left: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: darkTheme.textMuted,
                        zIndex: 1,
                      }}
                    />
                    <Form.Control
                      type="text"
                      placeholder="Search by Username"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "15px",
                        color: darkTheme.textPrimary,
                        padding: "15px 20px 15px 45px",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
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
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    onClick={downloadExcel}
                    disabled={isExporting}
                    style={{
                      background: `linear-gradient(135deg, ${darkTheme.accent4}, #7c3aed)`,
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
                      marginLeft: "auto",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.05)";
                      e.target.style.boxShadow = `0 5px 15px ${darkTheme.accent4}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    {isExporting ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <FaFileExcel size={16} />
                        Export As Excel
                      </>
                    )}
                  </Button>
                </Col>
              </Row>

              {/* Users Table */}
              <div
                style={{
                  background: darkTheme.bgSecondary,
                  borderRadius: "15px",
                  overflow: "hidden",
                  border: `1px solid ${darkTheme.border}`,
                }}
              >
                <Table
                  responsive
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
      color: "white",
      fontWeight: "bold",
      backgroundColor: "#2d2d2d",
      padding: "12px",
      minWidth: "60px",
      textAlign: "center",
    }}
  >
    S.NO
  </th>
  <th
    style={{
      color: "white",
      fontWeight: "bold",
      backgroundColor: "#2d2d2d",
      padding: "12px",
      minWidth: "120px",
      textAlign: "center",
    }}
  >
    USER NAME
  </th>
  <th
    style={{
      color: "white",
      fontWeight: "bold",
      backgroundColor: "#2d2d2d",
      padding: "12px",
      minWidth: "100px",
      textAlign: "center",
    }}
  >
    USER POINTS
  </th>
  <th
    style={{
      color: "white",
      fontWeight: "bold",
      backgroundColor: "#2d2d2d",
      padding: "12px",
      minWidth: "150px",
      textAlign: "center",
    }}
  >
    EMAIL
  </th>
  <th
    style={{
      color: "white",
      fontWeight: "bold",
      backgroundColor: "#2d2d2d",
      padding: "12px",
      minWidth: "150px",
      textAlign: "center",
    }}
  >
    LOGIN TYPE
  </th>
  <th
    style={{
      color: "white",
      fontWeight: "bold",
      backgroundColor: "#2d2d2d",
      padding: "12px",
      minWidth: "120px",
      textAlign: "center",
    }}
  >
    ACTION
  </th>
</tr>

                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: darkTheme.textSecondary,
                            border: "none",
                          }}
                        >
                          <div className="d-flex justify-content-center align-items-center">
                            <Spinner
                              style={{
                                color: darkTheme.accent3,
                                marginRight: "10px",
                              }}
                            />
                            Loading users...
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr
                          key={user._id}
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
                              padding: "12px",
                              minWidth: "60px",
                              color: "white",
                              border: "none",
                              textAlign: "center",
                            }}
                          >
                            {(currentPage - 1) * usersPerPage + index + 1}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              minWidth: "120px",
                              textAlign: "center",
                              border: "none",
                            }}
                          >
                            <span
                              style={{
                                color: darkTheme.accent3,
                                cursor: "pointer",
                                textDecoration: "underline",
                                fontWeight: "600",
                                transition: "all 0.3s ease",
                              }}
                              onClick={() =>
                                handleUsernameClick(user.userName, user._id)
                              }
                              onMouseEnter={(e) => {
                                e.target.style.color = "#7c3aed";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = darkTheme.accent3;
                              }}
                            >
                              {user.userName || "N/A"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              minWidth: "120px",
                              textAlign: "center",
                              color: "white",
                              border: "none",
                            }}
                          >
                            {user.ticketBalance || 0}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              minWidth: "120px",
                              color: "white",
                              border: "none",
                              textAlign: "center",
                            }}
                          >
                            {user.email || "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              minWidth: "120px",
                              color: "white",
                              border: "none",
                              textAlign: "center",
                            }}
                          >
                            {user.loginType || "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              minWidth: "120px",
                              textAlign: "center",
                              border: "none",
                            }}
                          >
                            <Button
                              onClick={() => openModal(user)}
                              style={{
                                background: `linear-gradient(135deg, ${darkTheme.accent2}, #7c3aed)`,
                                border: "none",
                                borderRadius: "10px",
                                padding: "8px 15px",
                                color: "#fff",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                transition: "all 0.3s ease",
                                margin: "0 auto",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "scale(1.1)";
                                e.target.style.boxShadow = `0 5px 15px ${darkTheme.accent2}50`;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "scale(1)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              <FaEye size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: darkTheme.textMuted,
                            fontWeight: "600",
                            border: "none",
                          }}
                        >
                          {searchTerm
                            ? `No users found matching "${searchTerm}"`
                            : "No users available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {!searchTerm && totalPages > 1 && (
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
                      const getButtonStyle = (pageNum) => ({
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        border: "none",
                        background:
                          currentPage === pageNum
                            ? `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`
                            : darkTheme.bgTertiary,
                        color:
                          currentPage === pageNum
                            ? "#fff"
                            : darkTheme.textPrimary,
                        fontWeight: currentPage === pageNum ? "600" : "normal",
                        transition: "all 0.3s ease",
                      });

                      const renderPageButton = (i) => (
                        <Button
                          key={i}
                          style={getButtonStyle(i)}
                          onClick={() => goToPage(i)}
                          onMouseEnter={(e) => {
                            if (currentPage !== i) {
                              e.target.style.background = darkTheme.bgCardHover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== i) {
                              e.target.style.background = darkTheme.bgTertiary;
                            }
                          }}
                        >
                          {i}
                        </Button>
                      );

                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++)
                          pages.push(renderPageButton(i));
                      } else {
                        if (currentPage <= 3) {
                          for (let i = 1; i <= 3; i++)
                            pages.push(renderPageButton(i));
                          pages.push(
                            <span
                              key="ellipsis1"
                              style={{
                                color: darkTheme.textMuted,
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
                                padding: "0 10px",
                              }}
                            >
                              ...
                            </span>
                          );
                          for (let i = totalPages - 2; i <= totalPages; i++)
                            pages.push(renderPageButton(i));
                        } else {
                          pages.push(renderPageButton(1));
                          pages.push(
                            <span
                              key="ellipsis3"
                              style={{
                                color: darkTheme.textMuted,
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
                          )
                            pages.push(renderPageButton(i));
                          pages.push(
                            <span
                              key="ellipsis4"
                              style={{
                                color: darkTheme.textMuted,
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Viewing User */}
      <Modal
        show={modalVisible}
        onHide={closeModal}
        backdrop="static"
        centered
        style={{
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: darkTheme.bgCard,
            border: `1px solid ${darkTheme.border}`,
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <Modal.Header
            style={{
              background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
              border: "none",
              padding: "25px",
            }}
          >
            <Modal.Title
              style={{ color: "#fff", fontWeight: "500", marginRight: "10px" }}
            >
              <FaUsers size={24} style={{ marginRight: "10px" }} />
              User Details
            </Modal.Title>
            <Button
              onClick={closeModal}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "34px",
                padding: "0",
                width: "40px",
                height: "70px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute", // Position it in the top-left corner
                top: "10px", // Adjust top position if needed
                left: "450px", // Adjust left position for placement
              }}
            >
              ×
            </Button>
          </Modal.Header>
          <Modal.Body style={{ padding: "30px", background: darkTheme.bgCard }}>
            {selectedUser ? (
              <div>
                <Row className="g-3">
                  <Col md={6}>
                    <div
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "10px",
                        padding: "15px",
                      }}
                    >
                      <label
                        style={{
                          color: darkTheme.textMuted,
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        User ID
                      </label>
                      <p
                        style={{
                          color: darkTheme.textPrimary,
                          fontSize: "14px",
                          fontWeight: "600",
                          margin: 0,
                          wordBreak: "break-all",
                        }}
                      >
                        {selectedUser._id || "N/A"}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "10px",
                        padding: "15px",
                      }}
                    >
                      <label
                        style={{
                          color: darkTheme.textMuted,
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        User Name
                      </label>
                      <p
                        style={{
                          color: darkTheme.textPrimary,
                          fontSize: "16px",
                          fontWeight: "600",
                          margin: 0,
                        }}
                      >
                        {selectedUser.userName || "N/A"}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "10px",
                        padding: "15px",
                      }}
                    >
                      <label
                        style={{
                          color: darkTheme.textMuted,
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        User Points
                      </label>
                      <p
                        style={{
                          color: darkTheme.accent3,
                          fontSize: "18px",
                          fontWeight: "700",
                          margin: 0,
                        }}
                      >
                        {selectedUser.ticketBalance || 0}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "10px",
                        padding: "15px",
                      }}
                    >
                      <label
                        style={{
                          color: darkTheme.textMuted,
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Email
                      </label>
                      <p
                        style={{
                          color: darkTheme.textPrimary,
                          fontSize: "16px",
                          fontWeight: "600",
                          margin: 0,
                          wordBreak: "break-all",
                        }}
                      >
                        {selectedUser.email || "N/A"}
                      </p>
                    </div>
                  </Col>
                  <Col md={12}>
                    <div
                      style={{
                        background: darkTheme.bgSecondary,
                        border: `1px solid ${darkTheme.border}`,
                        borderRadius: "10px",
                        padding: "15px",
                      }}
                    >
                      <label
                        style={{
                          color: darkTheme.textMuted,
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Login Type
                      </label>
                      <p
                        style={{
                          color: darkTheme.textPrimary,
                          fontSize: "16px",
                          fontWeight: "600",
                          margin: 0,
                        }}
                      >
                        {selectedUser.loginType || "N/A"}
                      </p>
                    </div>
                  </Col>
                </Row>
              </div>
            ) : (
              <p style={{ textAlign: "center", color: darkTheme.textMuted }}>
                No user selected
              </p>
            )}
          </Modal.Body>
          <Modal.Footer
            style={{
              background: darkTheme.bgCard,
              border: "none",
              padding: "20px 30px",
            }}
          >
            <Button
              onClick={closeModal}
              style={{
                background: `linear-gradient(135deg, ${darkTheme.accent3}, #7c3aed)`,
                border: "none",
                borderRadius: "10px",
                padding: "10px 25px",
                color: "#fff",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

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

export default Usermanagement;