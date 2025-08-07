
"use client"

import { useState, useEffect } from "react"
import { CRow, CCard, CCardHeader, CCardBody, CButton, CFormInput } from "@coreui/react"
import { getData } from "../../../apiConfigs/apiCalls"
import { GET_BOOSTER_TRANSACTIONS } from "../../../apiConfigs/endpoints"
import * as XLSX from "xlsx"

const BoosterTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 10

  const fetchTransactions = async () => {
    try {
      const response = await getData(GET_BOOSTER_TRANSACTIONS)
      console.log("API Response:", response)
      const data = response?.data || []
      setTransactions(data)
      setFilteredTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    const filtered = transactions.filter((transaction) =>
      transaction.BoosterName?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }, [searchTerm, transactions])

  const indexOfLastTransaction = currentPage * transactionsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction)

  const nextPage = () => {
    if (indexOfLastTransaction < filteredTransactions.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const downloadExcel = () => {
    const formattedData = transactions.map((transaction, index) => ({
      BoosterName: transaction.BoosterName,
      Amount: transaction.Amount,
      BoosterStart: new Date(transaction.BoosterStart).toLocaleString(),
      BoosterEnd: new Date(transaction.BoosterEnd).toLocaleString(),
      CreatedAt: new Date(transaction.createdAt).toLocaleString(),
      Status: transaction.Status,
    }))

    const ws = XLSX.utils.json_to_sheet(formattedData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "BoosterTransactions")
    XLSX.writeFile(wb, "booster_transactions.xlsx")
  }

  return (
    <CCard className="mb-4 shadow-lg rounded">
      <CCardHeader
        style={{
          backgroundColor: "#00B5E2", // Blue background color for the header
          color: "white", // White text color
        }}
        className="text-center"
      >
        <h5 className="fw-bold">Booster Transactions</h5>
      </CCardHeader>
      <CCardBody>
        <div className="container">
          <div className="mb-3 d-flex justify-content-between">
            <CFormInput
              type="text"
              placeholder="🔍 Search by Booster Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-50"
            />
            <CButton
              style={{
                backgroundColor: "#00B5E2", // Blue color for the button
                borderColor: "#00B5E2",
                color: "black", // Black text color
              }}
              onClick={downloadExcel}
              className="align-self-center"
            >
              EXPORT AS EXCEL
            </CButton>
          </div>
        </div>
        <CRow>
          <div className="container">
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center align-middle">
                <thead style={{ backgroundColor: "#00B5E2", color: "black" }}>
                  <tr>
                    <th>S.No</th>
                    <th>Booster Name</th>
                    <th>Amount</th>
                    <th>Booster Start</th>
                    <th>Booster End</th>
                    <th>Created At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.length > 0 ? (
                    currentTransactions.map((transaction, index) => (
                      <tr key={transaction._id} className="table-light">
                        <td className="fw-bold">{indexOfFirstTransaction + index + 1}</td>
                        <td>{transaction.BoosterName}</td>
                        <td>{transaction.Amount}</td>
                        <td>{new Date(transaction.BoosterStart).toLocaleString()}</td>
                        <td>{new Date(transaction.BoosterEnd).toLocaleString()}</td>
                        <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                        <td>{transaction.Status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        <h6>No transactions available</h6>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <CButton
                style={{
                  backgroundColor: "#00B5E2", // Blue color for the button
                  borderColor: "#00B5E2",
                  color: "black", // Black text color
                }}
                className="mx-2 px-4"
                disabled={currentPage === 1}
                onClick={prevPage}
              >
                ← Prev
              </CButton>
              <span className="mx-3 align-self-center">
                Page {currentPage} of {Math.ceil(filteredTransactions.length / transactionsPerPage)}
              </span>
              <CButton
                style={{
                  backgroundColor: "#00B5E2", // Blue color for the button
                  borderColor: "#00B5E2",
                  color: "black", // Black text color
                }}
                className="mx-2 px-4"
                disabled={indexOfLastTransaction >= filteredTransactions.length}
                onClick={nextPage}
              >
                Next →
              </CButton>
            </div>
          </div>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default BoosterTransactions
