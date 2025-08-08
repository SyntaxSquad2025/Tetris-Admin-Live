"use client"

import { useState, useEffect } from "react"
import { CRow, CCard, CCardHeader, CCardBody, CButton, CFormInput, CFormSelect, CAlert } from "@coreui/react"
import { getData } from "../../../apiConfigs/apiCalls"
import { SEARCH } from "../../../apiConfigs/endpoints"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"

const Gamehistory = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [historyType, setHistoryType] = useState("game")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const usersPerPage = 10

  const historyTypeOptions = [
    { value: "game", label: "Game" },
    { value: "task", label: "Task" },
    { value: "ads", label: "Ads" },
    { value: "dailyReward", label: "Daily Reward" },
    { value: "referral", label: "Referral" },
  ]

  const sortDataByDate = (data) => {
    // console.log("🔄 Sorting data by date:", data?.length || 0, "items")
    return data.sort((a, b) => {
      const dateA = new Date(
        a.createdAt || a.CompletionTime || a.completionTime || a.claimedAt || a.CompletedAt || a.initiated || 0,
      )
      const dateB = new Date(
        b.createdAt || b.CompletionTime || b.completionTime || b.claimedAt || b.CompletedAt || b.initiated || 0,
      )
      return dateB - dateA
    })
  }

  const fetchAllDataForExport = async () => {
    // console.log("📤 Starting export data fetch for type:", historyType)
    try {
      let typeParam = historyType
      if (typeParam === "dailyReward") typeParam = "dailyreward"
      if (typeParam === "game") typeParam = "gamehistory"
      if (typeParam === "task") typeParam = "tasks"

      const params = {
        type: typeParam,
        limit: 10000,
      }
      if (fromDate) params.fromDate = fromDate
      if (toDate) params.toDate = toDate
      if (searchTerm) {
        params.userId = searchTerm
      }

      if (typeParam === "withdrawal") {
        params.status = "transferred"
      }

      const queryString = Object.entries(params)
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        .join("&")

      // console.log("📤 Export API call:", `${SEARCH}?${queryString}`)
      const response = await getData(`${SEARCH}?${queryString}`)
      // console.log("📤 Export API response:", response)

      let dataList = []
      if (typeParam === "gamehistory") {
        dataList = response?.history || []
      } else if (typeParam === "tasks") {
        dataList = response?.tasks || []
      } else if (typeParam === "ads") {
        dataList = response?.ads || []
      } else if (typeParam === "dailyreward") {
        dataList = response?.rewards || []
      } else if (typeParam === "referral") {
        dataList = response?.data || []
      } else if (typeParam === "withdrawal") {
        dataList = response?.withdrawals || []
      }

      // console.log("📤 Export data extracted:", dataList?.length || 0, "items")
      return sortDataByDate(dataList)
    } catch (error) {
      // console.error("❌ Error fetching all data for export:", error)
      throw error
    }
  }

  const fetchData = async (paramsOverride = {}) => {
    // console.log("🔄 Fetching data for type:", historyType, "page:", currentPage)
    setIsLoading(true)
    setError(null)

    try {
      let response
      let dataList = []
      let typeParam = historyType
      if (typeParam === "dailyReward") typeParam = "dailyreward"
      if (typeParam === "game") typeParam = "gamehistory"
      if (typeParam === "task") typeParam = "tasks"

      const params = {
        type: typeParam,
        page: paramsOverride.resetPage ? 1 : currentPage,
        limit: usersPerPage,
        ...paramsOverride,
      }
      if (fromDate) params.fromDate = fromDate
      if (toDate) params.toDate = toDate
      if (searchTerm) {
        params.userId = searchTerm
      }

      if (typeParam === "withdrawal") {
        params.status = "transferred"
      }

      const queryString = Object.entries(params)
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        .join("&")

      // console.log("🌐 API call:", `${SEARCH}?${queryString}`)
      response = await getData(`${SEARCH}?${queryString}`)
      console.log("API response:", response)

      if (typeParam === "gamehistory") {
        dataList = response?.history || []
        setTotalPages(response?.totalPages || 1)
        setTotalCount(response?.length || 0)
        // console.log("🎮 Game history data:", dataList?.length || 0, "items")
      } else if (typeParam === "tasks") {
        dataList = response?.tasks || []
        setTotalPages(response?.totalPages || 1)
        setTotalCount(response?.length || 0)
        // console.log("📋 Tasks data:", dataList?.length || 0, "items")
      } else if (typeParam === "ads") {
        dataList = response?.ads || []
        setTotalPages(response?.totalPages || 1)
        setTotalCount(response?.length || 0)
        // console.log("📺 Ads data:", dataList?.length || 0, "items")
      } else if (typeParam === "dailyreward") {
        dataList = response?.rewards || []
        setTotalPages(response?.totalPages || 1)
        setTotalCount(response?.length || 0)
        // console.log("🎁 Daily reward data:", dataList?.length || 0, "items")
      } else if (typeParam === "referral") {
        dataList = response?.data || []
        setTotalPages(response?.totalPages || 1)
        setTotalCount(response?.length || response?.totalReferralsCount || 0)
        // console.log("👥 Referral data:", dataList?.length || 0, "items")
      } else if (typeParam === "withdrawal") {
        dataList = response?.withdrawals || []
        setTotalPages(response?.totalPages || 1)
        setTotalCount(response?.length || 0)
        // console.log("💰 Withdrawal data:", dataList?.length || 0, "items")
      }

      // console.log("📋 Raw data list:", dataList)
      // console.log("📊 Total pages:", response?.totalPages || 1)
      // console.log("🔢 Total count:", response?.length || 0)

      const sortedData = sortDataByDate(dataList)
      // console.log("✅ Final sorted data:", sortedData)

      setUsers(sortedData)
      setFilteredUsers(sortedData)
    } catch (error) {
      console.error(`❌ Error fetching ${historyType} data:`, error)
      setError({
        type: historyType,
        message: `Unable to fetch ${historyType} data.`,
        details: error.message || "Unknown error",
      })
      setUsers([])
      setFilteredUsers([])
      setTotalPages(1)
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // console.log("🔄 History type changed to:", historyType)
    fetchData({ resetPage: true })
    setSearchTerm("")
    setFromDate("")
    setToDate("")
    setCurrentPage(1)
  }, [historyType])

  useEffect(() => {
    // console.log("📄 Page changed to:", currentPage)
    fetchData()
  }, [historyType, currentPage])

  const handleSearch = () => {
    // console.log("🔍 Search triggered with:", { searchTerm, fromDate, toDate, historyType })
    setCurrentPage(1)
    fetchData()
  }

  const handleFromDateChange = (e) => {
    // console.log("📅 From date changed:", e.target.value)
    setFromDate(e.target.value)
  }

  const handleToDateChange = (e) => {
  //   console.log("📅 To date changed:", e.target.value)
    setToDate(e.target.value)
  }

  const handleRetry = () => {
    // console.log("🔄 Retry triggered")
    fetchData()
  }

  const handleReset = () => {
    // console.log("🔄 Reset triggered")
    setSearchTerm("")
    setFromDate("")
    setToDate("")
    setCurrentPage(1)
    fetchData()
  }

  const currentUsers = filteredUsers
  // console.log("👥 Current users to display:", currentUsers?.length || 0)

  const nextPage = () => {
    if (currentPage < totalPages) {
      // console.log("➡️ Moving to next page:", currentPage + 1)
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      // console.log("⬅️ Moving to previous page:", currentPage - 1)
      setCurrentPage(currentPage - 1)
    }
  }

  const handleUserIdClick = async (userId) => {
    // console.log("👤 User ID clicked:", userId)
    if (!userId) {
      alert("User ID is required")
      return
    }

    try {
      sessionStorage.setItem("selectedUserId", userId)
      navigate(`/user-game-details/${encodeURIComponent(userId)}`)
    } catch (error) {
      // console.error("❌ Error navigating to user details:", error)
      alert("Error navigating to user details. Please try again.")
    }
  }

  const downloadExcel = async () => {
    // console.log("📊 Excel export started")
    setIsExporting(true)

    try {
      const allData = await fetchAllDataForExport()

      if (!allData || allData.length === 0) {
        alert("No data to export")
        return
      }

      let formattedData = []

      if (historyType === "game") {
        formattedData = allData.map((user, index) => ({
          SNo: index + 1,
          UserId: user.userId || "N/A",
          UserName: user.userName || "N/A",
          GameTitle: user.gameTitle || "N/A",
          CreatedAt: user.createdAt || "N/A",
          UpdatedAt: user.updatedAt || "N/A",
          InitialBalance: user.initialBalance || 0,
          BetAmount: user.betAmount || 0,
          Prize: user.winAmount || 0,
          FinalBalance: user.finalBalance || 0,
          PlayedStatus: user.playedStatus || "N/A",
        }))
      } else if (historyType === "task") {
        formattedData = allData.map((task, index) => ({
          SNo: index + 1,
          UserId: task.userId || "N/A",
          UserName: task.userName || "N/A",
          Initiated: task.completionTime ||"N/A",
          InitialBalance: task.initialBalance || 0,
          RewardAmount: task.rewardPoints || 0,
          FinalBalance: task.finalBalance || 0,
          Status: task.status || "Completed",
        }))
      } else if (historyType === "ads") {
        formattedData = allData.map((ad, index) => ({
          SNo: index + 1,
          UserId: ad.userId || "N/A",
          UserName: ad.userName || "N/A",
          Initiated: ad.completionTime || "N/A",
          InitialBalance: ad.initialBalance || 0,
          RewardPoints: ad.rewardPoints || 0,
          FinalBalance: ad.finalBalance || 0,
        }))
      } else if (historyType === "dailyReward") {
        formattedData = allData.map((claim, index) => ({
          SNo: index + 1,
          UserId: claim.userId || "N/A",
          UserName: claim.userName || "N/A",
          Initiated: claim.claimedAt|| "N/A",
          InitialBalance: claim.initialBalance || 0,
          RewardPoints: claim.rewardPoints || 0,
          FinalBalance: claim.finalBalance || 0,
          Status: claim.Status || "Claimed",
        }))
      } else if (historyType === "referral") {
        formattedData = allData.map((referral, index) => ({
          SNo: index + 1,
          ReferringUserId: referral.referringUser?._id || "N/A",
          ReferringUserName: referral.referringUser?.userName || "N/A",
          ReferredUserId: referral.referredUser?._id || "N/A",
          ReferredUserName: referral.referredUser?.userName || "N/A",
          Initiated: referral.createdAt ||"N/A",
          InitialBalance: referral.initialBalance || 0,
          ReferralAmount: referral.referralAmount || 0,
          FinalBalance: referral.finalBalance || 0,
        }))
      }

      // console.log("📊 Formatted data for export:", formattedData?.length || 0, "items")

      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, `${historyType}History`)

      const fileName = `${historyType}_history_${new Date().toISOString().split("T")[0]}.xlsx`
      XLSX.writeFile(wb, fileName)

      // console.log("✅ Excel file exported:", fileName)
    } catch (error) {
      // console.error("❌ Error exporting to Excel:", error)
      alert("Error exporting data to Excel. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const renderTableHeaders = () => {
    if (historyType === "game") {
      return (
        <tr>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "60px",
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
            }}
          >
            USER ID
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
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
              minWidth: "120px",
            }}
          >
            GAME TITLE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "150px",
            }}
          >
            CREATED AT
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "150px",
            }}
          >
            UPDATED AT
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            INITIAL BALANCE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "100px",
            }}
          >
            BET AMOUNT
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "80px",
            }}
          >
            PRIZE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            FINAL BALANCE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            PLAYED STATUS
          </th>
        </tr>
      )
    } else if (historyType === "task") {
      return (
        <tr>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "60px",
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
            }}
          >
            USER ID
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
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
              minWidth: "150px",
            }}
          >
            INITIATED
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            INITIAL BALANCE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            REWARD AMOUNT
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            FINAL BALANCE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "100px",
            }}
          >
            STATUS
          </th>
        </tr>
      )
    } else if (historyType === "ads") {
      return (
        <tr>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "60px",
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
            }}
          >
            USER ID
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
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
              minWidth: "150px",
            }}
          >
            INITIATED
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            INITIAL BALANCE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            REWARD POINTS
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            FINAL BALANCE
          </th>
        </tr>
      )
    } else if (historyType === "dailyReward") {
      return (
        <tr>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "60px",
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
            }}
          >
            USER ID
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
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
              minWidth: "150px",
            }}
          >
            INITIATED
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            INITIAL BALANCE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            REWARD AMOUNT
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            FINAL BALANCE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "100px",
            }}
          >
            STATUS
          </th>
        </tr>
      )
    } else if (historyType === "referral") {
      return (
        <tr>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "60px",
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
              minWidth: "150px",
            }}
          >
            REFERRING USER ID
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "150px",
            }}
          >
            REFERRING USER NAME
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "150px",
            }}
          >
            REFERRED USER ID
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "150px",
            }}
          >
            REFERRED USER NAME
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "150px",
            }}
          >
            INITIATED
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            INITIAL BALANCE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            REFERRAL AMOUNT
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
            }}
          >
            FINAL BALANCE
          </th>
        </tr>
      )
    } else {
      return (
        <tr>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "60px",
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
            }}
          >
            USER ID
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "120px",
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
            }}
          >
            TYPE
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "150px",
            }}
          >
            DETAILS
          </th>
          <th
            style={{
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#2d2d2d",
              padding: "12px",
              minWidth: "150px",
            }}
          >
            DATE
          </th>
        </tr>
      )
    }
  }

  const renderTableRows = () => {
    // console.log("🎨 Rendering table rows for", currentUsers?.length || 0, "users")

    if (currentUsers.length === 0) {
      const colSpan =
        historyType === "game"
          ? 11
          : historyType === "task"
            ? 8
            : historyType === "ads"
              ? 7
              : historyType === "dailyReward"
                ? 8
                : historyType === "referral"
                  ? 9
                  : 6
      return (
        <tr>
          <td
            colSpan={colSpan}
            className="text-center py-4"
            style={{ backgroundColor: "#1a1a1a", color: "#888", padding: "20px" }}
          >
            <h6>No {historyType} history available</h6>
          </td>
        </tr>
      )
    }

    if (historyType === "game") {
      return currentUsers.map((user, index) => {
        // console.log(`🎮 Rendering game row ${index + 1}:`, user)
        return (
          <tr
            key={user._id || user.id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px", minWidth: "60px" }} className="fw-bold">
              {(currentPage - 1) * usersPerPage + index + 1}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>
              <span
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#8b5cf6",
                  fontWeight: "bold",
                }}
                onClick={() => handleUserIdClick(user.userId || user._id)}
              >
                {user.userId || user._id || "N/A"}
              </span>
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{user.userName || "N/A"}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{user.gameTitle || "N/A"}</td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
            </td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "N/A"}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{user.initialBalance || 0}</td>
            <td style={{ padding: "12px", minWidth: "100px" }}>{user.betAmount || 0}</td>
            <td style={{ padding: "12px", minWidth: "80px" }}>{user.winAmount || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{user.finalBalance || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{user.playedStatus || "N/A"}</td>
          </tr>
        )
      })
    } else if (historyType === "task") {
      return currentUsers.map((task, index) => {
      //   console.log(`📋 Rendering task row ${index + 1}:`, task)
        return (
          <tr
            key={task._id || task.id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px", minWidth: "60px" }} className="fw-bold">
              {(currentPage - 1) * usersPerPage + index + 1}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>
              <span
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#8b5cf6",
                  fontWeight: "bold",
                }}
                onClick={() => handleUserIdClick(task.userId || task._id)}
              >
                {task.userId || task._id || "N/A"}
              </span>
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{task.userName || "N/A"}</td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              {task.completionTime ? new Date(task.completionTime).toLocaleString() : "N/A"}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{task.initialBalance || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{task.rewardPoints || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{task.finalBalance || 0}</td>
            <td style={{ padding: "12px", minWidth: "100px" }}>{task.status || "Completed"}</td>
          </tr>
        )
      })
    } else if (historyType === "ads") {
      return currentUsers.map((ad, index) => {
        // console.log(`📺 Rendering ads row ${index + 1}:`, ad)
        return (
          <tr
            key={ad._id || ad.id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px", minWidth: "60px" }} className="fw-bold">
              {(currentPage - 1) * usersPerPage + index + 1}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>
              <span
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#8b5cf6",
                  fontWeight: "bold",
                }}
                onClick={() => handleUserIdClick(ad.userId || ad._id)}
              >
                {ad.userId || ad._id || "N/A"}
              </span>
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{ad.userName || "N/A"}</td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              {ad.completionTime ? new Date(ad.completionTime).toLocaleString() : "N/A"}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{ad.initialBalance || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{ad.rewardPoints || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{ad.finalBalance || 0}</td>
          </tr>
        )
      })
    } else if (historyType === "dailyReward") {
      return currentUsers.map((claim, index) => {
        // console.log(`🎁 Rendering daily reward row ${index + 1}:`, claim)
        return (
          <tr
            key={claim._id || claim.id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px", minWidth: "60px" }} className="fw-bold">
              {(currentPage - 1) * usersPerPage + index + 1}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>
              <span
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#8b5cf6",
                  fontWeight: "bold",
                }}
                onClick={() => handleUserIdClick(claim.userId || claim._id)}
              >
                {claim.userId || claim._id || "N/A"}
              </span>
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{claim.userName || "N/A"}</td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              {claim.claimedAt ? new Date(claim.claimedAt).toLocaleString() : "N/A"}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{claim.initialBalance || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{claim.rewardPoints || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{claim.finalBalance || 0}</td>
            <td style={{ padding: "12px", minWidth: "100px" }}>{claim.status || "CLAIMED"}</td>
          </tr>
        )
      })
    } else if (historyType === "referral") {
      return currentUsers.map((referral, index) => {
        // console.log(`👥 Rendering referral row ${index + 1}:`, referral)
        return (
          <tr
            key={referral._id || referral.id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px", minWidth: "60px" }} className="fw-bold">
              {(currentPage - 1) * usersPerPage + index + 1}
            </td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              <span
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#8b5cf6",
                  fontWeight: "bold",
                }}
                onClick={() => handleUserIdClick(referral.referringUser?._id)}
              >
                {referral.referringUser?._id || "N/A"}
              </span>
            </td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              <span>{referral.referringUser?.userName || "N/A"}</span>
            </td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              <span>{referral.referredUser?._id || "N/A"}</span>
            </td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              <span>{referral.referredUser?.userName || "N/A"}</span>
            </td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              {referral.createdAt ? new Date(referral.createdAt).toLocaleString() : "N/A"}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{referral.initialBalance || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{referral.referralAmount || 0}</td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{referral.finalBalance || 0}</td>
          </tr>
        )
      })
    } else {
      return currentUsers.map((item, index) => {
        // console.log(`📄 Rendering generic row ${index + 1}:`, item)
        return (
          <tr
            key={item._id || item.id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px", minWidth: "60px" }} className="fw-bold">
              {(currentPage - 1) * usersPerPage + index + 1}
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>
              <span
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#8b5cf6",
                  fontWeight: "bold",
                }}
                onClick={() => handleUserIdClick(item.userId || item._id)}
              >
                {item.userId || item._id || "N/A"}
              </span>
            </td>
            <td style={{ padding: "12px", minWidth: "120px" }}>{item.username || "N/A"}</td>
            <td style={{ padding: "12px", minWidth: "100px" }}>{historyType}</td>
            <td style={{ padding: "12px", minWidth: "150px" }}>{"Details not available"}</td>
            <td style={{ padding: "12px", minWidth: "150px" }}>
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
            </td>
          </tr>
        )
      })
    }
  }

  const getSearchPlaceholder = () => {
    switch (historyType) {
      case "game":
        return "Search by User ID"
      case "task":
        return "Search by User ID"
      case "ads":
        return "Search by User ID"
      case "dailyReward":
        return "Search by User ID"
      case "referral":
        return "Search by Referring User ID"
      default:
        return "Search by User ID"
    }
  }

  return (
    <div style={{ backgroundColor: "#0f0f0f", minHeight: "100vh", color: "white", padding: "20px" }}>
      <CCard style={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}>
        <CCardHeader
          style={{ backgroundColor: "#8b5cf6", color: "white", padding: "15px 20px" }}
          className="text-center"
        >
          <h5 className="fw-bold mb-0">{historyType.charAt(0).toUpperCase() + historyType.slice(1)} History</h5>
        </CCardHeader>
        <CCardBody style={{ backgroundColor: "#1a1a1a", color: "white", padding: "20px" }}>
          {/* Responsive Filter Section */}
          <div className="mb-4">
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-3">
                <label className="d-block mb-2" style={{ color: "white", fontWeight: "bold" }}>
                  Search
                </label>
                <CFormInput
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    backgroundColor: "#2d2d2d",
                    borderColor: "#444",
                    borderRadius: "4px",
                    height: "40px",
                    color: "white",
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-2">
                <label className="d-block mb-2" style={{ color: "white", fontWeight: "bold" }}>
                  From
                </label>
                <CFormInput
                  type="date"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  style={{
                    backgroundColor: "#2d2d2d",
                    borderColor: "#444",
                    borderRadius: "4px",
                    height: "40px",
                    color: "white",
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-2">
                <label className="d-block mb-2" style={{ color: "white", fontWeight: "bold" }}>
                  To
                </label>
                <CFormInput
                  type="date"
                  value={toDate}
                  onChange={handleToDateChange}
                  style={{
                    backgroundColor: "#2d2d2d",
                    borderColor: "#444",
                    borderRadius: "4px",
                    height: "40px",
                    color: "white",
                  }}
                />
              </div>
             <div className="col-12 col-md-6 col-lg-2">
  <label className="d-block mb-2" style={{ color: "white", fontWeight: "bold" }}>
    History Type
  </label>
  <div className="custom-select-wrapper" style={{ position: "relative" }}>
    <CFormSelect
      value={historyType}
      onChange={(e) => setHistoryType(e.target.value)}
      style={{
        backgroundColor: "#2d2d2d",
        borderColor: "#444",
        borderRadius: "4px",
        height: "40px",
        color: "white",
        paddingRight: "30px", // Add padding to make space for the arrow
      }}
    >
      {historyTypeOptions.map((option) => (
        <option
          key={option.value}
          value={option.value}
          style={{ backgroundColor: "#2d2d2d", color: "white" }}
        >
          {option.label}
        </option>
      ))}
    </CFormSelect>
    <i
      className="fas fa-chevron-down"
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "white",
        pointerEvents: "none", // Prevents the icon from blocking interaction
      }}
    />
  </div>
</div>

              <div className="col-12 col-lg-3">
                <label className="d-block mb-2" style={{ color: "transparent" }}>
                  Actions
                </label>
                <div className="d-flex gap-2">
                  <CButton
                    style={{
                      backgroundColor: "#8b5cf6",
                      borderColor: "#8b5cf6",
                      color: "white",
                      height: "40px",
                      flex: 1,
                    }}
                    onClick={handleSearch}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Search"}
                  </CButton>
                  <CButton
                    style={{
                      backgroundColor: "#6b7280",
                      borderColor: "#6b7280",
                      color: "white",
                      height: "40px",
                      flex: 1,
                    }}
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    Reset
                  </CButton>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <CAlert
              className="d-flex align-items-center justify-content-between mb-4"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                color: "white",
                padding: "15px",
              }}
            >
              <div>
                <strong>Error:</strong> {error.message}
                {error.details && <div className="mt-1 small">{error.details}</div>}
              </div>
              <CButton
                style={{
                  backgroundColor: "#ef4444",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                }}
                onClick={handleRetry}
              >
                Retry
              </CButton>
            </CAlert>
          )}

          <div className="d-flex justify-content-end mb-3">
            <CButton
              style={{
                backgroundColor: "#8b5cf6",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontWeight: "bold",
                padding: "10px 25px",
              }}
              onClick={downloadExcel}
              disabled={filteredUsers.length === 0 || isLoading || isExporting}
            >
              {isExporting ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  EXPORTING...
                </>
              ) : (
                "EXPORT AS EXCEL"
              )}
            </CButton>
          </div>

          <CRow>
            <div className="col-12">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: "#8b5cf6" }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2" style={{ color: "white" }}>
                    Loading {historyType} data...
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    border: "1px solid #333",
                    overflow: "auto",
                    maxHeight: "70vh",
                  }}
                >
                  <table
                    className="table text-center align-middle"
                    style={{
                      marginBottom: 0,
                      backgroundColor: "transparent",
                      minWidth: "1200px", // Ensures table doesn't compress too much
                    }}
                  >
                    <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>{renderTableHeaders()}</thead>
                    <tbody>{renderTableRows()}</tbody>
                  </table>
                </div>
              )}

              <div className="d-flex justify-content-center mt-3">
                <nav aria-label="Page navigation">
                  <div
                    className="d-flex align-items-center gap-1 p-2"
                    style={{ backgroundColor: "#2d2d2d", borderRadius: "8px", border: "1px solid #444" }}
                  >
                    {/* Previous Button */}
                    <button
                      className="btn d-flex align-items-center justify-content-center border-0"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: currentPage === 1 ? "#444" : "#8b5cf6",
                        color: "#ffffff",
                        fontWeight: "bold",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        borderRadius: "6px",
                      }}
                      disabled={currentPage === 1 || isLoading}
                      onClick={prevPage}
                    >
                      &#8249;
                    </button>

                    {/* Page Numbers */}
                    {(() => {
                      const pages = []
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <button
                              key={i}
                              className="btn d-flex align-items-center justify-content-center border-0"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: currentPage === i ? "#8b5cf6" : "#1a1a1a",
                                color: "#ffffff",
                                fontWeight: currentPage === i ? "bold" : "normal",
                                border: "1px solid #444",
                                borderRadius: "6px",
                              }}
                              onClick={() => setCurrentPage(i)}
                            >
                              {i}
                            </button>,
                          )
                        }
                      } else {
                        if (currentPage <= 3) {
                          for (let i = 1; i <= 3; i++) {
                            pages.push(
                              <button
                                key={i}
                                className="btn d-flex align-items-center justify-content-center border-0"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: currentPage === i ? "#8b5cf6" : "#1a1a1a",
                                  color: "#ffffff",
                                  fontWeight: currentPage === i ? "bold" : "normal",
                                  border: "1px solid #444",
                                  borderRadius: "6px",
                                }}
                                onClick={() => setCurrentPage(i)}
                              >
                                {i}
                              </button>,
                            )
                          }
                          if (totalPages > 4) {
                            pages.push(
                              <span
                                key="ellipsis1"
                                className="d-flex align-items-center px-2"
                                style={{ color: "#888" }}
                              >
                                ...
                              </span>,
                            )
                            pages.push(
                              <button
                                key={totalPages}
                                className="btn d-flex align-items-center justify-content-center border-0"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: "#1a1a1a",
                                  color: "#ffffff",
                                  border: "1px solid #444",
                                  borderRadius: "6px",
                                }}
                                onClick={() => setCurrentPage(totalPages)}
                              >
                                {totalPages}
                              </button>,
                            )
                          }
                        } else if (currentPage >= totalPages - 2) {
                          pages.push(
                            <button
                              key={1}
                              className="btn d-flex align-items-center justify-content-center border-0"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#1a1a1a",
                                color: "#ffffff",
                                border: "1px solid #444",
                                borderRadius: "6px",
                              }}
                              onClick={() => setCurrentPage(1)}
                            >
                              1
                            </button>,
                          )
                          pages.push(
                            <span key="ellipsis2" className="d-flex align-items-center px-2" style={{ color: "#888" }}>
                              ...
                            </span>,
                          )
                          for (let i = totalPages - 2; i <= totalPages; i++) {
                            pages.push(
                              <button
                                key={i}
                                className="btn d-flex align-items-center justify-content-center border-0"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: currentPage === i ? "#8b5cf6" : "#1a1a1a",
                                  color: "#ffffff",
                                  fontWeight: currentPage === i ? "bold" : "normal",
                                  border: "1px solid #444",
                                  borderRadius: "6px",
                                }}
                                onClick={() => setCurrentPage(i)}
                              >
                                {i}
                              </button>,
                            )
                          }
                        } else {
                          pages.push(
                            <button
                              key={1}
                              className="btn d-flex align-items-center justify-content-center border-0"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#1a1a1a",
                                color: "#ffffff",
                                border: "1px solid #444",
                                borderRadius: "6px",
                              }}
                              onClick={() => setCurrentPage(1)}
                            >
                              1
                            </button>,
                          )
                          pages.push(
                            <span key="ellipsis3" className="d-flex align-items-center px-2" style={{ color: "#888" }}>
                              ...
                            </span>,
                          )
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(
                              <button
                                key={i}
                                className="btn d-flex align-items-center justify-content-center border-0"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: currentPage === i ? "#8b5cf6" : "#1a1a1a",
                                  color: "#ffffff",
                                  fontWeight: currentPage === i ? "bold" : "normal",
                                  border: "1px solid #444",
                                  borderRadius: "6px",
                                }}
                                onClick={() => setCurrentPage(i)}
                              >
                                {i}
                              </button>,
                            )
                          }
                          pages.push(
                            <span key="ellipsis4" className="d-flex align-items-center px-2" style={{ color: "#888" }}>
                              ...
                            </span>,
                          )
                          pages.push(
                            <button
                              key={totalPages}
                              className="btn d-flex align-items-center justify-content-center border-0"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#1a1a1a",
                                color: "#ffffff",
                                border: "1px solid #444",
                                borderRadius: "6px",
                              }}
                              onClick={() => setCurrentPage(totalPages)}
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
                      className="btn d-flex align-items-center justify-content-center border-0"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: currentPage >= totalPages ? "#444" : "#8b5cf6",
                        color: "#ffffff",
                        fontWeight: "bold",
                        cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                        borderRadius: "6px",
                      }}
                      disabled={currentPage >= totalPages || isLoading}
                      onClick={nextPage}
                    >
                      &#8250;
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </CRow>
        </CCardBody>
      </CCard>

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

export default Gamehistory