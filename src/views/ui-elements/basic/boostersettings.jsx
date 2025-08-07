

"use client"

import { useState, useEffect } from "react"
import { CCard, CCardHeader, CCardBody, CButton, CFormInput, CAlert, CSpinner } from "@coreui/react"
import { getData, postData } from "../../../apiConfigs/apiCalls"
import { GET_BOOSTER_SETTING, BOOSTER_SETTING } from "../../../apiConfigs/endpoints"

const Boostersetting = () => {
  const [boosterData, setBoosterData] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBoosterSettings()
  }, [])

  const fetchBoosterSettings = async () => {
    try {
      const response = await getData(GET_BOOSTER_SETTING)
      if (response?.data?.length > 0) {
        setBoosterData(response.data[0]) // Assuming only one booster setting exists
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error fetching booster settings"
      setError(errorMessage)
      console.error("Error fetching booster settings:", error)
    }
  }

  const handleChange = (e) => {
    setBoosterData({ ...boosterData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Make sure we have the required ID
      if (!boosterData._id) {
        throw new Error("Missing booster setting ID")
      }

      const updatedData = {
        BoostersettingId: boosterData._id, // Map _id to BoostersettingId
        BoosterWalletAddress: boosterData.BoosterWalletAddress || "",
        BoosterContent: boosterData.BoosterContent || "",
        BoosterNote1: boosterData.BoosterNote1 || "",
        BoosterNote2: boosterData.BoosterNote2 || "",
        Status: boosterData.Status || "",
      }

      console.log("Submitting Data:", updatedData)
      const response = await postData(BOOSTER_SETTING, updatedData)

      if (response && response.success === false) {
        // Handle API error response
        throw new Error(response.message || "Failed to update booster settings")
      }

      setSuccess(response.message || "Booster setting updated successfully!")

      // Keep editing mode active for a short time to show the success message
      setTimeout(() => {
        setIsEditing(false)
        fetchBoosterSettings()
      }, 1500)
    } catch (error) {
      // Get detailed error message
      const errorMessage = error.response?.data?.message || error.message || "Error updating booster settings"
      setError(errorMessage)
      console.error("Error updating booster settings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CCard className="mb-4 shadow-lg p-4">
      <CCardHeader
        style={{
          backgroundColor: "#00B5E2", // Blue background color for the header
          color: "white", // White text color
        }}
        className="text-center"
      >
        <h5 className="fw-bold">Booster Settings</h5>
      </CCardHeader>
      <CCardBody>
        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </CAlert>
        )}

        {error && (
          <CAlert color="danger" dismissible onClose={() => setError(null)}>
            {error}
          </CAlert>
        )}

        <div className="container">
          <div className="mb-3">
            <label className="fw-bold">Booster Wallet Address</label>
            <CFormInput
              type="text"
              name="BoosterWalletAddress"
              value={boosterData.BoosterWalletAddress || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="mb-3">
            <label className="fw-bold">Booster Content</label>
            <CFormInput
              type="text"
              name="BoosterContent"
              value={boosterData.BoosterContent || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="mb-3">
            <label className="fw-bold">Booster Note 1</label>
            <CFormInput
              type="text"
              name="BoosterNote1"
              value={boosterData.BoosterNote1 || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="mb-3">
            <label className="fw-bold">Booster Note 2</label>
            <CFormInput
              type="text"
              name="BoosterNote2"
              value={boosterData.BoosterNote2 || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="mb-3">
            <label className="fw-bold">Status</label>
            <CFormInput
              type="text"
              name="Status"
              value={boosterData.Status || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="d-flex justify-content-center">
            {isEditing ? (
              <>
                <CButton
                  color="secondary"
                  className="me-2"
                  onClick={() => {
                    setIsEditing(false)
                    setError(null)
                    fetchBoosterSettings() // Reset to original data
                  }}
                  disabled={loading}
                >
                  Cancel
                </CButton>
                <CButton
                  style={{
                    backgroundColor: "#00B5E2", // Blue color for the button
                    borderColor: "#00B5E2",
                    color: "white", // White text color
                  }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" /> Updating...
                    </>
                  ) : (
                    "Submit"
                  )}
                </CButton>
              </>
            ) : (
              <CButton
                style={{
                  backgroundColor: "#00B5E2", // Blue color for the button
                  borderColor: "#00B5E2",
                  color: "white", // White text color
                }}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </CButton>
            )}
          </div>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default Boostersetting

