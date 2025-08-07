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
  Alert,
} from "react-bootstrap";
import {
  FaTasks,
  FaSearch,
  FaEdit,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
} from "react-icons/fa";
import { getData, postData } from "../../../apiConfigs/apiCalls";
import { GET_TASK, ADD_TASK, UPDATE_TASK } from "../../../apiConfigs/endpoints";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const tasksPerPage = 10;
  const [totalPages, setTotalPages] = useState(1); // Add this line to initialize totalPages

  // Dark theme colors (matching user management page)
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

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getData(GET_TASK);
      console.log("Tasks API Response:", response); // Add this line
      setTasks(response?.allTasks || []);
    } catch (error) {
      console.log("Tasks API Error:", error); // Add this line
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filtered tasks based on search term
  const filteredTasks = tasks.filter((task) =>
    [task.taskName, task.subTask, task.description].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const nextPage = () => {
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Open modal for new task
  const handleAddTask = () => {
    setSelectedTask({
      taskName: "",
      taskImage: "",
      subTask: "",
      description: "",
      rewardPoints: 0,
      siteLink: "",
      siteImg: "",
      status: "ACTIVE",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Open modal for editing task
  const handleEditClick = (task) => {
    setSelectedTask({ ...task });
    setIsEditing(true);
    setShowModal(true);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedTask((prev) => ({ ...prev, [name]: value }));
  };

  // Save or update task
  const handleSave = async () => {
    setLoading(true);
    try {
      const requestBody = { ...selectedTask };
      if (isEditing) {
        requestBody.taskId = selectedTask._id;
        await postData(UPDATE_TASK, requestBody);
        setSuccess("Task updated successfully!");
      } else {
        await postData(ADD_TASK, requestBody);
        setSuccess("Task added successfully!");
      }
      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
        fetchTasks();
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Dark theme loading state
  if (loading && tasks.length === 0) {
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
            Loading Tasks
          </h3>
          <p style={{ color: darkTheme.textSecondary }}>
            Fetching task data...
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <FaTasks
                  size={24}
                  style={{ color: "#fff", marginRight: "10px" }}
                />
                <h3 style={{ color: "#fff", margin: 0, fontWeight: "600" }}>
                  Tasks
                </h3>
              </div>
              <Button
                onClick={handleAddTask}
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
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 5px 15px rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <FaPlus size={16} />
                Add Task
              </Button>
            </div>

            <Card.Body style={{ padding: "40px" }}>
              {/* Success/Error Messages */}
              {success && (
                <Alert
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
                  dismissible
                  onClose={() => setError(null)}
                >
                  <i className="fas fa-exclamation-triangle me-2" />
                  {error}
                </Alert>
              )}

              {/* Tasks Table */}
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
                          color: "#fff",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          padding: "20px",
                          fontSize: "14px",
                          border: "none",
                          textAlign: "center",
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
                          textAlign: "center",
                        }}
                      >
                        Task Name
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
                          textAlign: "center",
                        }}
                      >
                        Task Image
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
                          textAlign: "center",
                        }}
                      >
                        Sub Task
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
                          textAlign: "center",
                        }}
                      >
                        Description
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
                          textAlign: "center",
                        }}
                      >
                        Reward Points
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
                          textAlign: "center",
                        }}
                      >
                        Site Link
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
                          textAlign: "center",
                        }}
                      >
                        Site Image
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
                          textAlign: "center",
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
                          textAlign: "center",
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
                          colSpan="10"
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
                            Loading tasks...
                          </div>
                        </td>
                      </tr>
                    ) : currentTasks.length > 0 ? (
                      currentTasks.map((task, index) => (
                        <tr
                          key={task._id}
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
                              color: "white",
                              border: "none",
                              textAlign: "center",
                            }}
                          >
                            {indexOfFirstTask + index + 1}
                          </td>
                          <td
                            style={{
                              padding: "20px",
                              color: "white",
                              border: "none",
                              textAlign: "center",
                            }}
                          >
                            {task.taskName || "N/A"}
                          </td>
                          <td style={{ padding: "20px", border: "none", textAlign: "center" }}>
                            {task.taskImage ? (
                              <img
                                src={task.taskImage || "/placeholder.svg"}
                                alt="Task"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: `2px solid ${darkTheme.border}`,
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                background: darkTheme.bgTertiary,
                                display: task.taskImage ? "none" : "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `2px solid ${darkTheme.border}`,
                                margin: "0 auto",
                              }}
                            >
                              <FaImage
                                size={16}
                                style={{ color: darkTheme.textMuted }}
                              />
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "20px",
                              color: "white",
                              border: "none",
                              textAlign: "center",
                            }}
                          >
                            {task.subTask || "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "20px",
                              color: darkTheme.textSecondary,
                              border: "none",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "200px",
                                margin: "0 auto",
                                color: "white",
                              }}
                            >
                              {task.description || "N/A"}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "20px",
                              color: "white",
                              border: "none",
                              textAlign: "center",
                            }}
                          >
                            {task.rewardPoints || "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "20px",
                              color: "white",
                              border: "none",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "150px",
                                margin: "0 auto",
                              }}
                            >
                              {task.siteLink || "N/A"}
                            </div>
                          </td>
                          <td style={{ padding: "20px", border: "none", textAlign: "center" }}>
                            {task.siteImg ? (
                              <img
                                src={task.siteImg || "/placeholder.svg"}
                                alt="Site"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: `2px solid ${darkTheme.border}`,
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                background: darkTheme.bgTertiary,
                                display: task.siteImg ? "none" : "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `2px solid ${darkTheme.border}`,
                                margin: "0 auto",
                              }}
                            >
                              <FaImage
                                size={16}
                                style={{ color: darkTheme.textMuted }}
                              />
                            </div>
                          </td>
                          <td style={{ padding: "20px", border: "none", textAlign: "center" }}>
                            <span
                              style={{
                                background:
                                  task.status === "ACTIVE"
                                    ? `${darkTheme.success}20`
                                    : `${darkTheme.danger}20`,
                                color:
                                  task.status === "ACTIVE"
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
                              {task.status || "N/A"}
                            </span>
                          </td>
                          <td style={{ padding: "20px", border: "none", textAlign: "center" }}>
                            <Button
                              onClick={() => handleEditClick(task)}
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
                                margin: "0 auto",
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
                              <FaEdit size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: darkTheme.textMuted,
                            fontWeight: "600",
                            border: "none",
                          }}
                        >
                          No tasks available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredTasks.length > 0 && (
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
                        filteredTasks.length / tasksPerPage
                      );

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

      {/* Modal for Add/Edit Task */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
        centered
        size="lg"
        style={{ zIndex: 9999 }}
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
            <Modal.Title style={{ color: "#fff", fontWeight: "600" }}>
              <FaTasks size={25} style={{ marginRight: "10px" }} />
              {isEditing ? "Edit Task" : "Add New Task"}
            </Modal.Title>
            <Button
              onClick={() => setShowModal(false)}
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
                left: "750px", // Adjust left position for placement
              }}
            >
              ×
            </Button>
          </Modal.Header>
          <Modal.Body style={{ padding: "30px", background: darkTheme.bgCard }}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                    }}
                  >
                    Task Name
                  </Form.Label>
                  <Form.Control
                    name="taskName"
                    value={selectedTask?.taskName || ""}
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
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                    }}
                  >
                    Sub Task
                  </Form.Label>
                  <Form.Control
                    name="subTask"
                    value={selectedTask?.subTask || ""}
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
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                    }}
                  >
                    Task Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={selectedTask?.description || ""}
                    onChange={handleChange}
                    style={{
                      background: darkTheme.bgSecondary,
                      border: `1px solid ${darkTheme.border}`,
                      borderRadius: "10px",
                      color: darkTheme.textPrimary,
                      padding: "12px 15px",
                      resize: "vertical",
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
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                    }}
                  >
                    Reward Points
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="rewardPoints"
                    value={selectedTask?.rewardPoints || ""}
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
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                    }}
                  >
                    Status
                  </Form.Label>
                  <Form.Select
                    name="status"
                    value={selectedTask?.status || ""}
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
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                    }}
                  >
                    Task Image URL
                  </Form.Label>
                  <Form.Control
                    name="taskImage"
                    value={selectedTask?.taskImage || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
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
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                    }}
                  >
                    Site Link
                  </Form.Label>
                  <Form.Control
                    name="siteLink"
                    value={selectedTask?.siteLink || ""}
                    onChange={handleChange}
                    placeholder="https://example.com"
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
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label
                    style={{
                      color: darkTheme.textSecondary,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                    }}
                  >
                    Site Image URL
                  </Form.Label>
                  <Form.Control
                    name="siteImg"
                    value={selectedTask?.siteImg || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/site-image.jpg"
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
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer
            style={{
              background: darkTheme.bgCard,
              border: "none",
              padding: "20px 30px",
            }}
          >
            <Button
              onClick={() => setShowModal(false)}
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
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
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
              {loading ? (
                <>
                  <Spinner size="sm" />
                  {isEditing ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{isEditing ? "Save Changes" : "Add Task"}</>
              )}
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

export default Tasks;