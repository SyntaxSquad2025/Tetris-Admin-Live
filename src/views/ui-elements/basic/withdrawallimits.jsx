"use client"

import { useState, useEffect } from "react"
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
} from "@coreui/react"
import { getData, postData } from "../../../apiConfigs/apiCalls"
import { GET_WITHDRAWAL_LIMITS, UPDATE_WITHDRAW_LIMITS } from "../../../apiConfigs/endpoints"

const WithdrawalLimits = () => {
  const [limits, setLimits] = useState([])
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedLimit, setSelectedLimit] = useState({ minAmount: "", maxAmount: "", status: "" })
  const [currentPage, setCurrentPage] = useState(1)
  const limitsPerPage = 10

  const fetchLimits = async () => {
    try {
      const response = await getData(GET_WITHDRAWAL_LIMITS)
      setLimits(response?.data || [])
    } catch (error) {
      console.error("Error fetching limits:", error)
      setError(error.message)
    }
  }

  useEffect(() => {
    fetchLimits()
  }, [])

  const indexOfLastLimit = currentPage * limitsPerPage
  const indexOfFirstLimit = indexOfLastLimit - limitsPerPage
  const currentLimits = limits.slice(indexOfFirstLimit, indexOfLastLimit)

  const nextPage = () => {
    if (indexOfLastLimit < limits.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleEditClick = (limit) => {
    setSelectedLimit({ ...limit })
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSelectedLimit((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      const endpoint = UPDATE_WITHDRAW_LIMITS.replace(":id", selectedLimit._id)
      await postData(endpoint, selectedLimit)

      // Wait to fetch updated list before closing modal and updating UI
      const freshData = await getData(GET_WITHDRAWAL_LIMITS)
      setLimits(freshData?.data || [])

      setShowModal(false)
      setCurrentPage(1) // optional: reset to first page after update
    } catch (error) {
      console.error("Error updating limit:", error)
    }
  }

  return (
    <CCard className="mb-4 shadow-lg">
      <CCardHeader
        style={{
          backgroundColor: "#00B5E2",
          color: "white",
        }}
        className="text-center"
      >
        <h5 className="fw-bold">Withdrawal Limits</h5>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <div className="container">
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center align-middle">
                <thead style={{ backgroundColor: "#00B5E2", color: "black" }}>
                  <tr>
                    <th>S.No</th>
                    <th>Min Amount</th>
                    <th>Max Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLimits.length > 0 ? (
                    currentLimits.map((limit, index) => (
                      <tr key={limit._id} className="table-light">
                        <td className="fw-bold">{indexOfFirstLimit + index + 1}</td>
                        <td>{limit.minWithdrawal || 0}</td>
                        <td>{limit.maxWithdrawal || 0}</td>
                        <td>
                          <CButton
                            style={{
                              color: "black",
                            }}
                            className="me-2"
                            onClick={() => handleEditClick(limit)}
                          >
                            <i className="fas fa-edit" style={{ fontSize: "15px" }} />
                          </CButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted fw-bold py-3">
                        No withdrawal limits available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-center align-items-center mt-4">
              <CButton
                style={{
                  backgroundColor: "#00B5E2",
                  borderColor: "#00B5E2",
                  color: "black",
                }}
                className="me-3"
                disabled={currentPage === 1}
                onClick={prevPage}
              >
                ← Prev
              </CButton>
              <span className="fw-bold text-secondary">
                Page {currentPage} of {Math.ceil(limits.length / limitsPerPage)}
              </span>
              <CButton
                style={{
                  backgroundColor: "#00B5E2",
                  borderColor: "#00B5E2",
                  color: "black",
                }}
                className="ms-3"
                disabled={indexOfLastLimit >= limits.length}
                onClick={nextPage}
              >
                Next →
              </CButton>
            </div>
          </div>
        </CRow>
      </CCardBody>

      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader
          style={{
            backgroundColor: "#00B5E2",
            color: "white",
          }}
        >
          Edit Withdrawal Limit
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Minimum Amount"
              name="minWithdrawal"
              type="number"
              value={selectedLimit?.minWithdrawal || ""}
              onChange={handleChange}
              className="mb-3"
            />
            <CFormInput
              label="Maximum Amount"
              name="maxWithdrawal"
              type="number"
              value={selectedLimit?.maxWithdrawal || ""}
              onChange={handleChange}
              className="mb-3"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton
            style={{
              backgroundColor: "#00B5E2",
              borderColor: "#00B5E2",
              color: "white",
            }}
            onClick={handleSave}
          >
            Save
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default WithdrawalLimits
