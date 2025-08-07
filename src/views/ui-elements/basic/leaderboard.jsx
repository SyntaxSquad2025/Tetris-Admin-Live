"use client"

import { useState, useEffect } from "react"
import { CRow, CCard, CCardHeader, CCardBody, CButton, CSpinner, CAlert, CFormInput, CFormSelect } from "@coreui/react"
import { getData } from "../../../apiConfigs/apiCalls"
import { FaTrophy, FaMedal, FaAward } from "react-icons/fa"
import * as XLSX from "xlsx"

const AdminLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("ticketBalance")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // You'll need to replace this with your actual leaderboard API endpoint
  const LEADERBOARD_ENDPOINT = "/api/admin/leaderboard" // Replace with your actual endpoint

  const fetchLeaderboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Replace this with your actual API call
      const response = await getData(LEADERBOARD_ENDPOINT)

      if (response?.users && Array.isArray(response.users)) {
        // Sort data by ticketBalance in descending order and add ranks
        const sortedData = response.users
          .sort((a, b) => (b.ticketBalance || 0) - (a.ticketBalance || 0))
          .map((item, index) => ({
            ...item,
            rank: index + 1,
          }))

        setLeaderboardData(sortedData)
        setFilteredData(sortedData)
      } else {
        setLeaderboardData([])
        setFilteredData([])
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
      setError("Failed to fetch leaderboard data")
      setLeaderboardData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...leaderboardData]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort functionality
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || 0
      let bValue = b[sortBy] || 0

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Re-assign ranks after filtering and sorting
    filtered = filtered.map((item, index) => ({
      ...item,
      displayRank: index + 1,
    }))

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, sortBy, sortOrder, leaderboardData])

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-warning me-2" />
      case 2:
        return <FaMedal className="text-secondary me-2" />
      case 3:
        return <FaAward className="text-warning me-2" style={{ color: "#CD7F32" }} />
      default:
        return null
    }
  }

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "warning"
      case 2:
        return "secondary"
      case 3:
        return "info"
      default:
        return "light"
    }
  }

  const downloadExcel = () => {
    const formattedData = filteredData.map((user) => ({
      Rank: user.rank,
      Username: user.username || "N/A",
      Email: user.email || "N/A",
      "Ticket Balance": user.ticketBalance || 0,
      "Total Games": user.totalGames || 0,
      "Games Won": user.gamesWon || 0,
      "Win Rate": user.totalGames > 0 ? ((user.gamesWon / user.totalGames) * 100).toFixed(2) + "%" : "0%",
      "Join Date": user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
      "Last Active": user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "N/A",
    }))

    const ws = XLSX.utils.json_to_sheet(formattedData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Leaderboard")

    XLSX.writeFile(wb, "admin_leaderboard.xlsx")
  }

  const handleRefresh = () => {
    fetchLeaderboardData()
  }

  return (
    <CCard className="mb-4 shadow-lg rounded">
      <CCardHeader
        style={{
          backgroundColor: "#00B5E2",
          color: "white",
        }}
        className="d-flex justify-content-between align-items-center"
      >
        <h5 className="fw-bold mb-0">
          <FaTrophy className="me-2" />
          Player Leaderboard
        </h5>
        <CButton
          style={{
            backgroundColor: "white",
            color: "#00B5E2",
            borderColor: "white",
          }}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? <CSpinner size="sm" className="me-1" /> : null}
          Refresh
        </CButton>
      </CCardHeader>

      <CCardBody style={{ padding: "1.5rem" }}>
        {error && (
          <CAlert color="danger" className="mb-4">
            {error}
          </CAlert>
        )}

        {/* Search and Filter Controls */}
        <div className="mb-4">
          <CRow className="g-3">
            <div className="col-md-4">
              <label className="form-label">Search Players</label>
              <CFormInput
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Sort By</label>
              <CFormSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <option value="ticketBalance">Ticket Balance</option>
                <option value="totalGames">Total Games</option>
                <option value="gamesWon">Games Won</option>
                <option value="username">Username</option>
                <option value="createdAt">Join Date</option>
              </CFormSelect>
            </div>
            <div className="col-md-3">
              <label className="form-label">Order</label>
              <CFormSelect
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </CFormSelect>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <CButton
                style={{
                  backgroundColor: "#00B5E2",
                  borderColor: "#00B5E2",
                  color: "white",
                  width: "100%",
                }}
                onClick={downloadExcel}
                disabled={filteredData.length === 0}
              >
                Export Excel
              </CButton>
            </div>
          </CRow>
        </div>

        {/* Statistics Cards */}
        <CRow className="mb-4 g-3">
          <div className="col-md-3">
            <CCard className="h-100 border-0 shadow-sm">
              <CCardBody className="text-center">
                <div
                  style={{
                    backgroundColor: "#00B5E2",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  <FaTrophy className="text-white" />
                </div>
                <h4 className="mb-0 fw-bold">{filteredData.length}</h4>
                <p className="text-muted mb-0">Total Players</p>
              </CCardBody>
            </CCard>
          </div>
          <div className="col-md-3">
            <CCard className="h-100 border-0 shadow-sm">
              <CCardBody className="text-center">
                <div
                  style={{
                    backgroundColor: "#00B5E2",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  <FaMedal className="text-white" />
                </div>
                <h4 className="mb-0 fw-bold">
                  {filteredData.length > 0 ? Math.max(...filteredData.map((u) => u.ticketBalance || 0)) : 0}
                </h4>
                <p className="text-muted mb-0">Highest Score</p>
              </CCardBody>
            </CCard>
          </div>
          <div className="col-md-3">
            <CCard className="h-100 border-0 shadow-sm">
              <CCardBody className="text-center">
                <div
                  style={{
                    backgroundColor: "#00B5E2",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  <FaAward className="text-white" />
                </div>
                <h4 className="mb-0 fw-bold">
                  {filteredData.length > 0
                    ? Math.round(filteredData.reduce((sum, u) => sum + (u.ticketBalance || 0), 0) / filteredData.length)
                    : 0}
                </h4>
                <p className="text-muted mb-0">Average Score</p>
              </CCardBody>
            </CCard>
          </div>
          <div className="col-md-3">
            <CCard className="h-100 border-0 shadow-sm">
              <CCardBody className="text-center">
                <div
                  style={{
                    backgroundColor: "#00B5E2",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  <i className="fas fa-users text-white"></i>
                </div>
                <h4 className="mb-0 fw-bold">{filteredData.filter((u) => (u.ticketBalance || 0) > 0).length}</h4>
                <p className="text-muted mb-0">Active Players</p>
              </CCardBody>
            </CCard>
          </div>
        </CRow>

        {loading ? (
          <div className="text-center py-5">
            <CSpinner color="primary" />
            <p className="mt-2">Loading leaderboard data...</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center align-middle">
                <thead style={{ backgroundColor: "#00B5E2", color: "white" }}>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Email</th>
                    <th>Ticket Balance</th>
                    <th>Total Games</th>
                    <th>Games Won</th>
                    <th>Win Rate</th>
                    <th>Join Date</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((user, index) => (
                      <tr key={user._id || index} className="table-light">
                        <td>
                          <div className="d-flex align-items-center justify-content-center">
                            {getRankIcon(user.rank)}
                            <span
                              className={`badge bg-${getRankBadgeColor(user.rank)} fw-bold`}
                              style={{ minWidth: "30px" }}
                            >
                              {user.rank}
                            </span>
                          </div>
                        </td>
                        <td className="fw-bold">{user.username || "N/A"}</td>
                        <td>{user.email || "N/A"}</td>
                        <td>
                          <span className="fw-bold text-primary">{user.ticketBalance || 0}</span>
                        </td>
                        <td>{user.totalGames || 0}</td>
                        <td>{user.gamesWon || 0}</td>
                        <td>
                          {user.totalGames > 0 ? (
                            <span className="badge bg-success">
                              {((user.gamesWon / user.totalGames) * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="badge bg-secondary">0%</span>
                          )}
                        </td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                        <td>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted py-4">
                        <h6>No players found</h6>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-4">
                <CButton
                  style={{
                    backgroundColor: "#00B5E2",
                    borderColor: "#00B5E2",
                    color: "white",
                  }}
                  className="me-3"
                  disabled={currentPage === 1}
                  onClick={prevPage}
                >
                  ← Prev
                </CButton>
                <span className="fw-bold text-secondary">
                  Page {currentPage} of {totalPages} ({filteredData.length} total players)
                </span>
                <CButton
                  style={{
                    backgroundColor: "#00B5E2",
                    borderColor: "#00B5E2",
                    color: "white",
                  }}
                  className="ms-3"
                  disabled={currentPage === totalPages}
                  onClick={nextPage}
                >
                  Next →
                </CButton>
              </div>
            )}
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default AdminLeaderboard
