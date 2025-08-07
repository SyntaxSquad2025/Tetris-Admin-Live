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
  CAlert,
} from "@coreui/react"
import { getData, postData } from "../../../apiConfigs/apiCalls"
import { GET_ALL_BOOSTERS, ADD_BOOSTER, UPDATE_BOOSTER } from "../../../apiConfigs/endpoints"

const AddBoosters = () => {
  const [boosters, setBoosters] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null) // Added success state
  const [showModal, setShowModal] = useState(false)
  const [selectedBooster, setSelectedBooster] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const boostersPerPage = 10

  // Fetch boosters
  const fetchBoosters = async () => {
    try {
      const response = await getData(GET_ALL_BOOSTERS)
      setBoosters(response?.data || [])
    } catch (error) {
      setError(error.message)
    }
  }

  useEffect(() => {
    fetchBoosters()
  }, [])

  // Pagination logic
  const indexOfLastBooster = currentPage * boostersPerPage
  const indexOfFirstBooster = indexOfLastBooster - boostersPerPage
  const currentBoosters = boosters.slice(indexOfFirstBooster, indexOfLastBooster)

  const nextPage = () => {
    if (indexOfLastBooster < boosters.length) setCurrentPage(currentPage + 1)
  }
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  // Open modal for new booster
  const handleAddBooster = () => {
    setSelectedBooster({
      BoosterName: "",
      BoosterImage: "",
      Price: "",
      Description: "",
      BoosterDuration: "",
      RewardMultiplier: "",
      BoosterStatus: "active",
    })
    setIsEditing(false)
    setSuccess(null) // Reset success message
    setShowModal(true)
  }

  // Open modal for editing booster
  const handleEditClick = (booster) => {
    setSelectedBooster({ ...booster })
    setIsEditing(true)
    setSuccess(null) // Reset success message
    setShowModal(true)
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setSelectedBooster((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Save or update booster
  const handleSave = async () => {
    try {
      const requestBody = { ...selectedBooster }
      if (isEditing) {
        requestBody.BoosterId = selectedBooster._id // Ensure BoosterId is sent
        await postData(UPDATE_BOOSTER, requestBody)
        setSuccess("Booster updated successfully!") // Set success message
      } else {
        await postData(ADD_BOOSTER, requestBody)
        setSuccess("Booster added successfully!") // Set success message
      }

      // Close modal after a short delay to show the success message
      setTimeout(() => {
        setShowModal(false)
        fetchBoosters()
      }, 1500)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <CCard className="mb-4 shadow-lg">
      <CCardHeader
        style={{
          backgroundColor: "#00B5E2", // Blue background color for the header
          color: "white", // White text color
        }}
        className="d-flex justify-content-between align-items-center"
      >
        <h5 className="fw-bold">Boosters</h5>
        <CButton
          style={{
            backgroundColor: "white",
            color: "black",
            borderColor: "white",
          }}
          className="fw-bold"
          onClick={handleAddBooster}
        >
          + Add Booster
        </CButton>
      </CCardHeader>
      <CCardBody>
        {/* Display success message if available */}
        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </CAlert>
        )}

        <CRow>
          <div className="container">
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center align-middle">
                <thead style={{ backgroundColor: "#00B5E2", color: "black" }}>
                  <tr>
                    <th>S.No</th>
                    <th>Booster Name</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th>Duration</th>
                    <th>Multiplier</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBoosters.length > 0 ? (
                    currentBoosters.map((booster, index) => (
                      <tr key={booster._id} className="table-light">
                        <td className="fw-bold">{indexOfFirstBooster + index + 1}</td>
                        <td>{booster.BoosterName}</td>
                        <td>
                          <img src={booster.BoosterImage || "/placeholder.svg"} alt="Booster" width="50" height="50" />
                        </td>
                        <td>{booster.Price}</td>
                        <td>{booster.Description}</td>
                        <td>{booster.BoosterDuration}</td>
                        <td>{booster.RewardMultiplier}</td>
                        <td>{booster.BoosterStatus}</td>
                        <td>
                          <CButton
                            style={{
                              color: "Black", //Black text color
                            }}
                            className="me-2"
                            onClick={() => handleEditClick(booster)}
                          >
                            <i className="fas fa-edit"></i>
                          </CButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted fw-bold py-3">
                        No boosters available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-center align-items-center mt-4">
              <CButton
                style={{
                  backgroundColor: "#00B5E2", // Blue color for the button
                  borderColor: "#00B5E2",
                  color: "black", // Black text color
                }}
                className="me-3"
                disabled={currentPage === 1}
                onClick={prevPage}
              >
                ← Prev
              </CButton>
              <span className="fw-bold text-secondary">
                Page {currentPage} of {Math.ceil(boosters.length / boostersPerPage)}
              </span>
              <CButton
                style={{
                  backgroundColor: "#00B5E2", // Blue color for the button
                  borderColor: "#00B5E2",
                  color: "black", // Black text color
                }}
                className="ms-3"
                disabled={indexOfLastBooster >= boosters.length}
                onClick={nextPage}
              >
                Next →
              </CButton>
            </div>
          </div>
        </CRow>
      </CCardBody>
      <CModal visible={showModal} onClose={() => setShowModal(false)} backdrop="static">
        <CModalHeader
          style={{
            backgroundColor: "#00B5E2", // Blue background color for the header
            color: "white", // White text color
          }}
        >
          {isEditing ? "Edit Booster" : "Add New Booster"}
        </CModalHeader>
        <CModalBody>
          {/* Display success message in modal if available */}
          {success && (
            <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
              {success}
            </CAlert>
          )}

          <CForm>
            <CFormInput
              label="Booster Name"
              name="BoosterName"
              value={selectedBooster?.BoosterName || ""}
              onChange={handleChange}
              className="mb-3"
            />
            <CFormInput
              label="Image URL"
              name="BoosterImage"
              value={selectedBooster?.BoosterImage || ""}
              onChange={handleChange}
              className="mb-3"
            />
            <CFormInput
              label="Price"
              name="Price"
              type="number"
              value={selectedBooster?.Price || ""}
              onChange={handleChange}
              className="mb-3"
            />
            <CFormInput
              label="Description"
              name="Description"
              value={selectedBooster?.Description || ""}
              onChange={handleChange}
              className="mb-3"
            />
            <CFormInput
              label="Duration"
              name="BoosterDuration"
              value={selectedBooster?.BoosterDuration || ""}
              onChange={handleChange}
              className="mb-3"
            />
            <CFormInput
              label="Multiplier"
              name="RewardMultiplier"
              value={selectedBooster?.RewardMultiplier || ""}
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
              backgroundColor: "#00B5E2", // Blue color for the button
              borderColor: "#00B5E2",
              color: "white", // White text color
            }}
            onClick={handleSave}
          >
            {isEditing ? "Save Changes" : "Add Booster"}
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default AddBoosters

