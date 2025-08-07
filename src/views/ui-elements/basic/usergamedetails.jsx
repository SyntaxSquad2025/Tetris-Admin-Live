"use client"

import { useState, useEffect } from "react"
import { CCard, CCardHeader, CCardBody, CButton, CBreadcrumb, CBreadcrumbItem } from "@coreui/react"
import { getData } from "../../../apiConfigs/apiCalls"
import { useParams, useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"
import { SEARCH, GET_USER_HISTORY } from "../../../apiConfigs/endpoints"

const UserGameDetails = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [userHistory, setUserHistory] = useState([])
  const [filteredHistory, setFilteredHistory] = useState([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userStats, setUserStats] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const limit = 10
  const [historyType, setHistoryType] = useState("")

  const historyTypeOptions = [
    { value: "", label: "All Types" },
    { value: "gamehistory", label: "Game" },
    { value: "tasks", label: "Task" },
    { value: "ads", label: "Ads" },
    { value: "dailyreward", label: "Daily Reward" },
    { value: "referral", label: "Referral" },
    { value: "withdrawal", label: "Withdrawal" },
  ]

  // Fetch user history with improved pagination logic
  const fetchUserHistory = async (page = 1, type = "") => {
    const currentUserId = userId || sessionStorage.getItem("selectedUserId")

    if (!currentUserId) {
      setError("No userId provided")
      navigate("/gamehistory")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (!type || type === "") {
        const response = await getData(
          `${GET_USER_HISTORY}?userId=${encodeURIComponent(currentUserId)}&page=${page}&limit=${limit}`,
        )

        if (response.success) {
          setUserHistory(response.data || [])
          setFilteredHistory(response.data || [])
          setTotalPages(response.totalPages || 1)
          setTotalRecords(response.totalRecords || 0)
          setUserStats(response.userStats || null)
          setSelectedUserId(currentUserId)
          sessionStorage.setItem("selectedUserId", currentUserId)
        } else {
          throw new Error(response.message || "Failed to fetch user history")
        }
      } else {
        const params = {
          type: type,
          userId: currentUserId,
          page: page,
          limit: limit,
        }

        if (type === "withdrawal") {
          params.status = "transferred"
        }

        const queryString = Object.entries(params)
          .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
          .join("&")

        const response = await getData(`${SEARCH}?${queryString}`)
        let dataList = []

        if (type === "gamehistory") {
          dataList = response?.history || []
        } else if (type === "tasks") {
          dataList = response?.tasks || []
        } else if (type === "ads") {
          dataList = response?.ads || []
        } else if (type === "dailyreward") {
          dataList = response?.rewards || []
        } else if (type === "referral") {
          dataList = response?.data || []
        } else if (type === "withdrawal") {
          dataList = response?.withdrawals || []
        }

        setUserHistory(dataList)
        setFilteredHistory(dataList)
        setTotalPages(response?.totalPages || 1)
        setTotalRecords(response?.length || dataList.length)
        setUserStats(null)

        setSelectedUserId(currentUserId)
        sessionStorage.setItem("selectedUserId", currentUserId)
      }
    } catch (error) {
      console.error("Error fetching user history:", error)

      let errorMessage = "Please try again"
      if (error.response) {
        errorMessage = `Server Error (${error.response.status}): ${error.response.data?.message || error.message}`
      } else if (error.request) {
        errorMessage = "Network Error: Unable to connect to server"
      } else {
        errorMessage = error.message || "Unknown error occurred"
      }

      setError(`Failed to fetch user data: ${errorMessage}`)
      setUserHistory([])
      setFilteredHistory([])
      setTotalPages(1)
      setTotalRecords(0)
      setUserStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const currentUserId = userId || sessionStorage.getItem("selectedUserId")

    if (!currentUserId) {
      setError("No userId provided")
      navigate("/gamehistory")
      return
    }

    setSelectedUserId(currentUserId)
    sessionStorage.setItem("selectedUserId", currentUserId)
    fetchUserHistory(currentPage)
  }, [userId])

  useEffect(() => {
    if (selectedUserId) {
      setCurrentPage(1)
      fetchUserHistory(1, historyType)
    }
  }, [historyType])

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      fetchUserHistory(newPage, historyType)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      fetchUserHistory(newPage, historyType)
    }
  }

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    fetchUserHistory(pageNumber, historyType)
  }

  const handleGoBack = () => {
    sessionStorage.removeItem("selectedUserId")
    navigate("/gamehistory")
  }

  const handleReset = () => {
    setHistoryType("")
    setCurrentPage(1)
    fetchUserHistory(1, "")
  }

  const fetchAllDataForExport = async () => {
    const currentUserId = userId || sessionStorage.getItem("selectedUserId")
    if (!currentUserId) {
      throw new Error("No userId provided")
    }

    setIsExporting(true)

    try {
      let allData = []

      if (!historyType || historyType === "") {
        let page = 1
        let totalPages = 1

        do {
          const response = await getData(
            `${GET_USER_HISTORY}?userId=${encodeURIComponent(currentUserId)}&page=${page}&limit=100`,
          )
          if (response.success && response.data) {
            allData = [...allData, ...response.data]
            totalPages = response.totalPages || 1
            page++
          } else {
            break
          }
        } while (page <= totalPages)
      } else {
        let page = 1
        let totalPages = 1

        do {
          const params = {
            type: historyType,
            userId: currentUserId,
            page: page,
            limit: 100,
          }

          if (historyType === "withdrawal") {
            params.status = "transferred"
          }

          const queryString = Object.entries(params)
            .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
            .join("&")

          const response = await getData(`${SEARCH}?${queryString}`)
          let dataList = []

          if (historyType === "gamehistory") {
            dataList = response?.history || []
          } else if (historyType === "tasks") {
            dataList = response?.tasks || []
          } else if (historyType === "ads") {
            dataList = response?.ads || []
          } else if (historyType === "dailyreward") {
            dataList = response?.rewards || []
          } else if (historyType === "referral") {
            dataList = response?.data || []
          } else if (historyType === "withdrawal") {
            dataList = response?.withdrawals || []
          }

          if (dataList && dataList.length > 0) {
            allData = [...allData, ...dataList]
            totalPages = response?.totalPages || 1
            page++
          } else {
            break
          }
        } while (page <= totalPages)
      }

      return allData
    } finally {
      setIsExporting(false)
    }
  }

  const downloadPlayerExcel = async () => {
    try {
      setIsExporting(true)

      const allData = await fetchAllDataForExport()

      if (!allData || allData.length === 0) {
        alert("No data to export")
        return
      }

      let formattedData = []

      if (!historyType || historyType === "") {
        formattedData = allData.map((item, index) => ({
          SNo: index + 1,
          UserName: item.userName || item.referringUser?.userName || "N/A",
          GameTitle: item.gameTitle || "N/A",
          CreatedAt: item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A",
          InitialBalance: item.initialBalance || item.InitalBalance || item.Initalbalance ||item.initialbalnce ||"N/A",
          BetAmount: getItemAmount(item),
          Prize: getItemReward(item),
          FinalBalance: getItemBalance(item),
          Status: getItemStatus(item),
        }))
      } else if (historyType === "gamehistory") {
        formattedData = allData.map((item, index) => ({
          SNo: index + 1,
          UserName: item.userName || "N/A",
          GameTitle: item.gameTitle || "N/A",
          CreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
          UpdatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A",
          InitialBalance: item.initialBalance || 0,
          BetAmount: item.betAmount || 0,
          Prize: item.winAmount || 0,
          FinalBalance: item.finalBalance || 0,
          PlayedStatus: item.playedStatus || "N/A",
        }))
      } else if (historyType === "tasks") {
        formattedData = allData.map((item, index) => ({
          SNo: index + 1,
          UserName: item.userName || "N/A",
          Initiated: item.completionTime ? new Date(item.completionTime).toLocaleString() : "N/A",
          InitialBalance: item.initialBalance || 0,
          RewardAmount: item.rewardPoints || 0,
          FinalBalance: item.finalBalance || 0,
          Status: item.status || "Completed",
        }))
      } else if (historyType === "ads") {
        formattedData = allData.map((item, index) => ({
          SNo: index + 1,
          UserName: item.userName || "N/A",
          Initiated: item.completionTime ? new Date(item.completionTime).toLocaleString() : "N/A",
          InitialBalance: item.initialBalance || 0,
          RewardPoints: item.rewardPoints || 0,
          FinalBalance: item.finalBalance || 0,
        }))
      } else if (historyType === "dailyreward") {
        formattedData = allData.map((item, index) => ({
          SNo: index + 1,
          UserName: item.userName || "N/A",
          Initiated: item.claimedAt ? new Date(item.claimedAt).toLocaleString() : "N/A",
          InitialBalance: item.initialBalance || 0,
          RewardAmount: item.rewardPoints || 0,
          FinalBalance: item.finalBalance || 0,
          Status: item.status || "Claimed",
        }))
      } else if (historyType === "referral") {
        formattedData = allData.map((item, index) => ({
          SNo: index + 1,
          ReferringUserName: item.referringUser?.userName || "N/A",
          ReferredUserName: item.referredUser?.userName || "N/A",
          Initiated: item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
          InitialBalance: item.initialBalance || 0,
          ReferralAmount: item.referralAmount || 0,
          FinalBalance: item.finalBalance || 0,
        }))
      } else if (historyType === "withdrawal") {
        formattedData = allData.map((item, index) => ({
          SNo: index + 1,
          UserName: item.userName || "N/A",
          Initiated: item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
          WalletAddress: item.walletAddress || "N/A",
          Amount: item.amount || 0,
          USDTAmount: item.usdt_Amount || 0,
          Status: item.status || "N/A",
        }))
      }

      const sheetName = historyType ? `${selectedUserId}_${historyType}` : `${selectedUserId}_history`
      const maxSheetNameLength = 31
      const truncatedSheetName =
        sheetName.length > maxSheetNameLength ? sheetName.substring(0, maxSheetNameLength) : sheetName

      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, truncatedSheetName)

      const fileName = `${selectedUserId}_${historyType || "all"}_${new Date().toISOString().split("T")[0]}.xlsx`
      XLSX.writeFile(wb, fileName)

      alert(`Successfully exported ${formattedData.length} records to Excel!`)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      alert("Failed to export data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const getItemDescription = (item) => {
    switch (item.type) {
      case "Game":
        return item.gameTitle || "Game Activity"
      case "Task":
        return item.TaskName || "Task Activity"
      case "Ad":
        return item.AdName || "Ad Activity"
      case "Reward":
        return "Daily Reward Claimed"
      case "Referral":
        return `Referred: ${item.referredUser?.username || "User"}`
      case "Withdrawal":
        return "Withdrawal Request"
      default:
        return "Activity"
    }
  }

  const getItemAmount = (item) => {
    switch (item.type) {
      case "Game":
        return item.betAmount || 0
      case "Withdrawal":
        return item.amount || 0
      default:
        return 0
    }
  }

  const getItemReward = (item) => {
    switch (item.type) {
      case "Game":
        return item.winAmount || 0
      case "Task":
        return item.Rewardpoints || 0
      case "Ad":
        return item.Rewardpoints || 0
      case "Reward":
        return item.rewardPoints || 0
      case "Referral":
        return item.referralamount || 0
      default:
        return 0
    }
  }

  const getItemBalance = (item) => {
    return item.finalbalance || item.finalBalance || item.FinalBalance || 0
  }

  const getItemStatus = (item) => {
    switch (item.type) {
      case "Game":
        return item.playedStatus || "N/A"
      case "Task":
      case "Ad":
        return item.Status || "Completed"
      case "Reward":
        return "Claimed"
      case "Referral":
        return "Completed"
      case "Withdrawal":
        return item.status || "N/A"
      default:
        return "N/A"
    }
  }

  const renderTableHeaders = () => {
    if (!historyType || historyType === "") {
      return (
        <tr>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>S.NO</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>USER NAME</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>GAME TITLE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>CREATED AT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>BET AMOUNT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>PRIZE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>FINAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>PLAYED STATUS</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>HISTORY TYPE</th>
        </tr>
      )
    } else if (historyType === "gamehistory") {
      return (
        <tr>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>S.NO</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>USER NAME</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>GAME TITLE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>CREATED AT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>UPDATED AT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>BET AMOUNT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>PRIZE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>FINAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>PLAYED STATUS</th>
        </tr>
      )
    } else if (historyType === "tasks") {
      return (
        <tr>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>S.NO</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>USER NAME</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIATED</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>REWARD AMOUNT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>FINAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>STATUS</th>
        </tr>
      )
    } else if (historyType === "ads") {
      return (
        <tr>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>S.NO</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>USER NAME</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIATED</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>REWARD POINTS</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>FINAL BALANCE</th>
        </tr>
      )
    } else if (historyType === "dailyreward") {
      return (
        <tr>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>S.NO</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>USER NAME</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIATED</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>REWARD AMOUNT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>FINAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>STATUS</th>
        </tr>
      )
    } else if (historyType === "referral") {
      return (
        <tr>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>S.NO</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>REFERRING USER NAME</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>REFERRED USER NAME</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIATED</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIAL BALANCE</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>REFERRAL AMOUNT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>FINAL BALANCE</th>
        </tr>
      )
    } else if (historyType === "withdrawal") {
      return (
        <tr>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>S.NO</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>USER NAME</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>INITIATED</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>WALLET ADDRESS</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>AMOUNT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>USDT AMOUNT</th>
          <th style={{ color: "white", fontWeight: "bold", backgroundColor: "#2d2d2d", padding: "12px" }}>STATUS</th>
        </tr>
      )
    }
  }

  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={10} className="text-center py-4" style={{ backgroundColor: "#1a1a1a", color: "white", padding: "20px" }}>
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border" style={{ color: "#8b5cf6" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Loading history data...</span>
            </div>
          </td>
        </tr>
      )
    }

    if (filteredHistory.length === 0) {
      return (
        <tr>
          <td colSpan={10} className="text-center py-4" style={{ backgroundColor: "#1a1a1a", color: "#888", padding: "20px" }}>
            <h6>No {historyType || "history"} available</h6>
          </td>
        </tr>
      )
    }

    return filteredHistory.map((item, index) => {
      const serialNumber = (currentPage - 1) * limit + index + 1
      const date =
        item.date || item.createdAt || item.updatedAt || item.CompletionTime || item.claimedAt || item.timestamp
      const formattedDate = date ? new Date(date).toLocaleString() : "N/A"

      if (!historyType || historyType === "") {
        return (
          <tr
            key={item._id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px" }} className="fw-bold">{serialNumber}</td>
            <td style={{ padding: "12px" }}>{item.userName || item.referringUser?.userName || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.gameTitle || "N/A"}</td>
            <td style={{ padding: "12px" }}>{formattedDate}</td>
            <td style={{ padding: "12px" }}>{item.initialbalance || item.initialBalance || item.InitialBalance || 0}</td>
            <td style={{ padding: "12px" }}>{item.betAmount || 0}</td>
            <td style={{ padding: "12px" }}>
              {item.prize || item.winAmount || item.rewardPoints || item.Rewardpoints || item.referralAmount || 0}
            </td>
            <td style={{ padding: "12px" }}>{item.finalbalance || item.finalBalance || item.FinalBalance || 0}</td>
            <td style={{ padding: "12px" }}>
              {item.playedstatus || item.playedStatus || item.status || (item.initiated ? "Completed" : "N/A") || "N/A"}
            </td>
            <td style={{ padding: "12px" }}>
              <span
                className="badge"
                style={{
                  backgroundColor: item.activityType === "Game"
                    ? "#3b82f6"
                    : item.activityType === "Task"
                      ? "#06b6d4"
                      : item.activityType === "Ad"
                        ? "#f59e0b"
                        : item.activityType === "Daily Reward"
                          ? "#10b981"
                          : item.activityType === "Referral"
                            ? "#6b7280"
                            : item.activityType === "Withdrawal"
                              ? "#ef4444"
                              : "#374151",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}
              >
                {item.type || "N/A"}
              </span>
            </td>
          </tr>
        )
      } else if (historyType === "gamehistory") {
        return (
          <tr
            key={item._id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px" }} className="fw-bold">{serialNumber}</td>
            <td style={{ padding: "12px" }}>{item.userName || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.gameTitle || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.initialBalance || 0}</td>
            <td style={{ padding: "12px" }}>{item.betAmount || 0}</td>
            <td style={{ padding: "12px" }}>{item.winAmount || 0}</td>
            <td style={{ padding: "12px" }}>{item.finalBalance || 0}</td>
            <td style={{ padding: "12px" }}>{item.playedStatus || "N/A"}</td>
          </tr>
        )
      } else if (historyType === "tasks") {
        return (
          <tr
            key={item._id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px" }} className="fw-bold">{serialNumber}</td>
            <td style={{ padding: "12px" }}>{item.userName || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.completionTime ? new Date(item.completionTime).toLocaleString() : "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.initialBalance || 0}</td>
            <td style={{ padding: "12px" }}>{item.rewardPoints || 0}</td>
            <td style={{ padding: "12px" }}>{item.finalBalance || 0}</td>
            <td style={{ padding: "12px" }}>{item.status || "Completed"}</td>
          </tr>
        )
      } else if (historyType === "ads") {
        return (
          <tr
            key={item._id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px" }} className="fw-bold">{serialNumber}</td>
            <td style={{ padding: "12px" }}>{item.userName || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.completionTime ? new Date(item.completionTime).toLocaleString() : "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.initialBalance || 0}</td>
            <td style={{ padding: "12px" }}>{item.rewardPoints || 0}</td>
            <td style={{ padding: "12px" }}>{item.finalBalance || 0}</td>
          </tr>
        )
      } else if (historyType === "dailyreward") {
        return (
          <tr
            key={item._id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px" }} className="fw-bold">{serialNumber}</td>
            <td style={{ padding: "12px" }}>{item.userName || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.claimedAt ? new Date(item.claimedAt).toLocaleString() : "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.initialBalance || 0}</td>
            <td style={{ padding: "12px" }}>{item.rewardPoints || 0}</td>
            <td style={{ padding: "12px" }}>{item.finalBalance || 0}</td>
            <td style={{ padding: "12px" }}>{item.status || "Claimed"}</td>
          </tr>
        )
      } else if (historyType === "referral") {
        return (
          <tr
            key={item._id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px" }} className="fw-bold">{serialNumber}</td>
            <td style={{ padding: "12px" }}>{item.referringUser?.userName || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.referredUser?.userName || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.initialBalance || 0}</td>
            <td style={{ padding: "12px" }}>{item.referralAmount || 0}</td>
            <td style={{ padding: "12px" }}>{item.finalBalance || 0}</td>
          </tr>
        )
      } else if (historyType === "withdrawal") {
        return (
          <tr
            key={item._id || index}
            style={{ backgroundColor: "#1a1a1a", color: "white", borderBottom: "1px solid #333" }}
            className="table-row-hover"
          >
            <td style={{ padding: "12px" }} className="fw-bold">{serialNumber}</td>
            <td style={{ padding: "12px" }}>{item.userName || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.walletAddress || "N/A"}</td>
            <td style={{ padding: "12px" }}>{item.amount || 0}</td>
            <td style={{ padding: "12px" }}>{item.usdt_Amount || 0}</td>
            <td style={{ padding: "12px" }}>{item.status || "N/A"}</td>
          </tr>
        )
      }
    })
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "#0f0f0f", minHeight: "100vh", color: "white", padding: "20px" }}>
        <CBreadcrumb className="mb-4" style={{ backgroundColor: "transparent" }}>
          <CBreadcrumbItem href="/gamehistory" style={{ color: "#8b5cf6" }}>
            Game History
          </CBreadcrumbItem>
          <CBreadcrumbItem active style={{ color: "white" }}>
            Error
          </CBreadcrumbItem>
        </CBreadcrumb>

        <CCard style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}>
          <CCardHeader style={{ backgroundColor: "#8b5cf6", color: "white" }}>
            <h5 className="mb-0">Error Loading User Data</h5>
          </CCardHeader>
          <CCardBody className="text-center py-5" style={{ color: "white" }}>
            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "8px", padding: "20px", color: "white" }}>
              <h4>⚠️ {error}</h4>
              <p>Please check the userId and try again.</p>
              <div className="mt-3">
                <CButton
                  style={{ backgroundColor: "#8b5cf6", border: "none", color: "white", marginRight: "10px" }}
                  onClick={() => {
                    setError("")
                    const currentUserId = userId || sessionStorage.getItem("selectedUserId")
                    if (currentUserId) {
                      fetchUserHistory(1)
                    }
                  }}
                >
                  Retry
                </CButton>
                <CButton
                  style={{ backgroundColor: "#6b7280", border: "none", color: "white" }}
                  onClick={handleGoBack}
                >
                  Go Back
                </CButton>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: "#0f0f0f", minHeight: "100vh", color: "white", padding: "20px" }}>
      <CBreadcrumb className="mb-4" style={{ backgroundColor: "transparent" }}>
        <CBreadcrumbItem href="/gamehistory" style={{ color: "#8b5cf6" }}>
          Game History
        </CBreadcrumbItem>
        <CBreadcrumbItem active style={{ color: "white" }}>
          {userStats?.username || selectedUserId}
        </CBreadcrumbItem>
      </CBreadcrumb>

      {/* History Type Filter */}
      <div className="mb-4">
        <div className="row">
          <div className="col-md-4">
            <label className="form-label fw-bold" style={{ color: "white" }}>
              History Type
            </label>
            <select
              className="form-select"
              value={historyType}
              onChange={(e) => setHistoryType(e.target.value)}
              style={{
                backgroundColor: "#1a1a1a",
                borderColor: "#333",
                borderRadius: "4px",
                height: "40px",
                color: "white",
              }}
            >
              {historyTypeOptions.map((option) => (
                <option key={option.value} value={option.value} style={{ backgroundColor: "#1a1a1a", color: "white" }}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <CButton
              style={{
                backgroundColor: "#8b5cf6",
                border: "none",
                borderRadius: "6px",
                height: "40px",
                color: "white",
                fontWeight: "bold",
                padding: "0 25px",
                marginRight: "10px"
              }}
              onClick={handleReset}
            >
              Reset Filter
            </CButton>
          </div>
        </div>
      </div>

      <CCard style={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}>
        <CCardHeader
          style={{ backgroundColor: "#8b5cf6", color: "white", padding: "15px 20px" }}
          className="d-flex justify-content-between align-items-center"
        >
            <h5 className="fw-bold mb-0">
          {userStats?.userName || selectedUserId}'s Dashboard
         </h5>
          <CButton
            style={{
              backgroundColor: "white",
              color: "#8b5cf6",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              padding: "8px 20px",
            }}
            onClick={handleGoBack}
          >
            Back to Game History
          </CButton>
        </CCardHeader>
        <CCardBody style={{ padding: "20px", backgroundColor: "#1a1a1a", color: "white" }}>
          {/* User Stats Dashboard */}
          {userStats && (
            <div className="mb-4">
              <h3 className="text-center mb-4" style={{ color: "#8b5cf6", fontWeight: "bold" }}>
                {userStats?.userName }'s Dashboard
              </h3>

            {/* Top Row - Main Stats */}
<div className="row mb-4 g-3">
  <div className="col-md-3">
    <CCard
      style={{
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        height: "200px", // Consistent height for all cards
      }}
    >
      <CCardBody className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <div
          style={{
            backgroundColor: "#8b5cf6",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <i className="fas fa-wallet text-white fs-4"></i>
        </div>
        <h6 className="mb-2" style={{ color: "#888" }}>
          Current Balance
        </h6>
        <h3 className="mb-0 fw-bold" style={{ color: "#8b5cf6" }}>
          {userStats.ticketBalance?.toLocaleString() || "0"}
        </h3>
      </CCardBody>
    </CCard>
  </div>

  <div className="col-md-3">
    <CCard
      style={{
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        height: "200px",
      }}
    >
      <CCardBody className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <div
          style={{
            backgroundColor: "#10b981",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <i className="fas fa-gamepad text-white fs-4"></i>
        </div>
        <h6 className="mb-2" style={{ color: "#888" }}>
          Games Played
        </h6>
        <h3 className="mb-0 fw-bold" style={{ color: "#10b981" }}>
          {userStats.totalGames || "0"}
        </h3>
        <small style={{ color: "#888" }}>
          W: {userStats.wins || 0} | L: {userStats.losses || 0}
        </small>
      </CCardBody>
    </CCard>
  </div>

  <div className="col-md-3">
    <CCard
      style={{
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        height: "200px",
      }}
    >
      <CCardBody className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <div
          style={{
            backgroundColor: "#06b6d4",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <i className="fas fa-tasks text-white fs-4"></i>
        </div>
        <h6 className="mb-2" style={{ color: "#888" }}>
          Tasks Completed
        </h6>
        <h3 className="mb-0 fw-bold" style={{ color: "#06b6d4" }}>
          {userStats.totalTasksDone || "0"}
        </h3>
        <small style={{ color: "#888" }}>
          Rewards: {userStats.totalTaskRewards || 0}
        </small>
      </CCardBody>
    </CCard>
  </div>

  <div className="col-md-3">
    <CCard
      style={{
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        height: "200px",
      }}
    >
      <CCardBody className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <div
          style={{
            backgroundColor: "#f59e0b",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <i className="fas fa-video text-white fs-4"></i>
        </div>
        <h6 className="mb-2" style={{ color: "#888" }}>
          Ads Watched
        </h6>
        <h3 className="mb-0 fw-bold" style={{ color: "#f59e0b" }}>
          {userStats.totalAdsWatched || "0"}
        </h3>
        <small style={{ color: "#888" }}>
          Rewards: {userStats.totalAdRewards || 0}
        </small>
      </CCardBody>
    </CCard>
  </div>
</div>

{/* Second Row - Additional Stats */}
<div className="row mb-4 g-3">
  <div className="col-md-3">
    <CCard
      style={{
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        height: "200px",
      }}
    >
      <CCardBody className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <div
          style={{
            backgroundColor: "#ef4444",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <i className="fas fa-gift text-white fs-4"></i>
        </div>
        <h6 className="mb-2" style={{ color: "#888" }}>
          Daily Rewards
        </h6>
        <h3 className="mb-0 fw-bold" style={{ color: "#ef4444" }}>
          {userStats.totalDailyRew || "0"}
        </h3>
        <small style={{ color: "#888" }}>
          Amount: {userStats.totalDailyAmt || 0}
        </small>
      </CCardBody>
    </CCard>
  </div>

  <div className="col-md-3">
    <CCard
      style={{
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        height: "200px",
      }}
    >
      <CCardBody className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <div
          style={{
            backgroundColor: "#8b5cf6",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <i className="fas fa-users text-white fs-4"></i>
        </div>
        <h6 className="mb-2" style={{ color: "#888" }}>
          Referrals
        </h6>
        <h3 className="mb-0 fw-bold" style={{ color: "#8b5cf6" }}>
          {userStats.totalReferrals || "0"}
        </h3>
        <small style={{ color: "#888" }}>
          Earnings: {userStats.totalRefEarn || 0}
        </small>
      </CCardBody>
    </CCard>
  </div>

  <div className="col-md-3">
    <CCard
      style={{
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        height: "200px",
      }}
    >
      <CCardBody className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <div
          style={{
            backgroundColor: "#10b981",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <i className="fas fa-money-bill-wave text-white fs-4"></i>
        </div>
        <h6 className="mb-2" style={{ color: "#888" }}>
          Withdrawals
        </h6>
        <h3 className="mb-0 fw-bold" style={{ color: "#10b981" }}>
          {userStats.totalWithdAmount?.toLocaleString() || "0"}
        </h3>
        <small style={{ color: "#888" }}>
          USDT: {userStats.totalTUSDT_AMOUNT || 0}
        </small>
      </CCardBody>
    </CCard>
  </div>

  <div className="col-md-3">
    <CCard
      style={{
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        height: "200px",
      }}
    >
      <CCardBody className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <div
          style={{
            backgroundColor: "#f97316",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <i className="fas fa-trophy text-white fs-4"></i>
        </div>
        <h6 className="mb-2" style={{ color: "#888" }}>
          Total Win Amount
        </h6>
        <h3 className="mb-0 fw-bold" style={{ color: "#f97316" }}>
          {userStats.totalWinAmountInGame?.toLocaleString() || "0"}
        </h3>
        <small style={{ color: "#888" }}>
          From {userStats.wins || 0} wins
        </small>
      </CCardBody>
    </CCard>
  </div>
</div>

{/* Third Row - Total Invested */}
<div className="row mb-4 g-3">
  <div className="col-md-3">
    <CCard
      style={{
        backgroundColor: "#2d2d2d",
        border: "1px solid #444",
        borderRadius: "8px",
        height: "200px",
      }}
    >
      <CCardBody className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <div
          style={{
            backgroundColor: "#8b5cf6",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <i className="fas fa-coins text-white fs-4"></i>
        </div>
        <h6 className="mb-2" style={{ color: "#888" }}>
          Total Invested
        </h6>
        <h3 className="mb-0 fw-bold" style={{ color: "#8b5cf6" }}>
          {userStats.totalBetAmount?.toLocaleString() || "0"}
        </h3>
      </CCardBody>
    </CCard>
  </div>
</div>

            </div>
          )}

          {/* History Section */}
          <div className="d-flex justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <h5 className="mb-0 me-3" style={{ color: "white" }}>
                {historyType === "gamehistory"
                  ? "Game History"
                  : historyType === "tasks"
                    ? "Task History"
                    : historyType === "ads"
                      ? "Ad History"
                      : historyType === "dailyreward"
                        ? "Daily Reward History"
                        : historyType === "referral"
                          ? "Referral History"
                          : historyType === "withdrawal"
                            ? "Transferred Withdrawals"
                            : "All Activity History"}
              </h5>
              <span 
                className="badge me-2" 
                style={{ backgroundColor: "#8b5cf6", color: "white", padding: "4px 8px", borderRadius: "4px" }}
              >
                {totalRecords} total records
              </span>
            </div>
            <CButton
              style={{
                backgroundColor: "#8b5cf6",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontWeight: "bold",
                padding: "10px 25px",
              }}
              onClick={downloadPlayerExcel}
              disabled={!filteredHistory.length || isExporting}
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

          <div style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #333", overflow: "hidden" }}>
            <table className="table text-center align-middle" style={{ marginBottom: 0, backgroundColor: "transparent" }}>
              <thead>{renderTableHeaders()}</thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <nav aria-label="Page navigation">
                <div className="d-flex align-items-center gap-1 p-2" style={{ backgroundColor: "#2d2d2d", borderRadius: "8px", border: "1px solid #444" }}>
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
                    disabled={currentPage === 1 || loading}
                    onClick={prevPage}
                  >
                    &#8249;
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const pages = []
                    const getButtonStyle = (pageNum) => ({
                      width: "40px",
                      height: "40px",
                      backgroundColor: currentPage === pageNum ? "#8b5cf6" : "#1a1a1a",
                      color: "#ffffff",
                      fontWeight: currentPage === pageNum ? "bold" : "normal",
                      border: "1px solid #444",
                      borderRadius: "6px",
                    })

                    const renderPageButton = (i) => (
                      <button
                        key={i}
                        className="btn d-flex align-items-center justify-content-center border-0"
                        style={getButtonStyle(i)}
                        onClick={() => goToPage(i)}
                        disabled={loading}
                      >
                        {i}
                      </button>
                    )

                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(renderPageButton(i))
                    } else {
                      if (currentPage <= 3) {
                        for (let i = 1; i <= 3; i++) pages.push(renderPageButton(i))
                        pages.push(
                          <span key="ellipsis1" className="d-flex align-items-center px-2" style={{ color: "#888" }}>
                            ...
                          </span>,
                        )
                        pages.push(renderPageButton(totalPages))
                      } else if (currentPage >= totalPages - 2) {
                        pages.push(renderPageButton(1))
                        pages.push(
                          <span key="ellipsis2" className="d-flex align-items-center px-2" style={{ color: "#888" }}>
                            ...
                          </span>,
                        )
                        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(renderPageButton(i))
                      } else {
                        pages.push(renderPageButton(1))
                        pages.push(
                          <span key="ellipsis3" className="d-flex align-items-center px-2" style={{ color: "#888" }}>
                            ...
                          </span>,
                        )
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(renderPageButton(i))
                        pages.push(
                          <span key="ellipsis4" className="d-flex align-items-center px-2" style={{ color: "#888" }}>
                            ...
                          </span>,
                        )
                        pages.push(renderPageButton(totalPages))
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
                      backgroundColor: currentPage === totalPages ? "#444" : "#8b5cf6",
                      color: "#ffffff",
                      fontWeight: "bold",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      borderRadius: "6px",
                    }}
                    disabled={currentPage === totalPages || loading}
                    onClick={nextPage}
                  >
                    &#8250;
                  </button>
                </div>
              </nav>
            </div>
          )}
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

export default UserGameDetails
