"use client"

import { useState } from "react"
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormTextarea,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CContainer,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react"
import { postData } from "../../../apiConfigs/apiCalls"
import { ANNOUNCEMENT } from "../../../apiConfigs/endpoints"

const Announcement = () => {
  const [announcement, setAnnouncement] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleChange = (e) => {
    setAnnouncement(e.target.value)
  }

  const handleSubmit = async () => {
    if (!announcement.trim()) {
      setMessage({ text: "Please enter an announcement", type: "warning" })
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false)
    setLoading(true)
    try {
      const response = await postData(ANNOUNCEMENT, { Notification: announcement })
      if (response?.status === "Success") {
        setMessage({ text: "Announcement sent to all users successfully!", type: "success" })
        setAnnouncement("")
      } else {
        setMessage({ text: response?.message || "Failed to send announcement", type: "danger" })
      }
    } catch (error) {
      console.error("Error submitting announcement:", error)
      setMessage({ text: "Failed to send announcement", type: "danger" })
    } finally {
      setLoading(false)
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000)
  }

  const handleCancelSubmit = () => {
    setShowConfirmModal(false)
    setLoading(false)
  }

  return (
    <CContainer
      fluid
      style={{
        minHeight: "100vh",
        background: "#18181b", // deep dark
        paddingTop: "60px",
      }}
    >
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard
            className="mb-4"
            style={{
              borderRadius: "12px",
              background: "#23232b", // card dark
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
              border: "none",
            }}
          >
            <CCardHeader
              style={{
                background: "linear-gradient(90deg, #a259ff 0%, #6050dc 100%)", // purple/violet gradient
                color: "white",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                textAlign: "center",
                borderBottom: "none"
              }}
            >
              <h4 style={{ margin: 0, fontWeight: "bold", letterSpacing: "0.5px" }}>
                <span role="img" aria-label="announcement">📢</span> Create Announcement
              </h4>
            </CCardHeader>
            <CCardBody className="p-4">
              {message.text && (
                <CAlert
                  color={message.type}
                  dismissible
                  onClose={() => setMessage({ text: "", type: "" })}
                  style={{
                    background: "#323043",
                    color: "#fff",
                    border: "none"
                  }}
                >
                  {message.text}
                </CAlert>
              )}

              <CRow>
                <CCol md={4} className="d-flex align-items-center">
                  <CFormLabel
                    className="mb-0 fw-bold"
                    style={{ color: "#e1e1e7", fontSize: "1.06rem" }}
                  >
                    Announcement Message
                  </CFormLabel>
                </CCol>
                <CCol md={8}>
                  <CFormTextarea
                    id="announcement"
                    rows={8}
                    value={announcement}
                    onChange={handleChange}
                    placeholder="Enter your announcement message here..."
                    style={{
                      background: "#101014",
                      color: "#fff",
                      border: "1px solid #2b2b35",
                      borderRadius: "8px",
                      padding: "16px 15px",
                      fontSize: "1.05rem",
                      minHeight: "140px",
                      marginBottom: "8px"
                    }}
                  />
                  <div style={{ color: "#8686a1", fontSize: "0.9rem", textAlign: "right" }}>
                    {announcement.length} characters
                  </div>
                </CCol>
              </CRow>

              <div className="d-flex justify-content-center mt-4">
                <CButton
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    background: loading
                      ? "#6150dc"
                      : "linear-gradient(90deg, #a259ff 0%, #6050dc 100%)",
                    borderColor: "transparent",
                    color: "#fff",
                    fontWeight: "bold",
                    width: "100%",
                    maxWidth: "350px",
                    borderRadius: "20px",
                    padding: "12px 0",
                    fontSize: "1.1rem",
                    letterSpacing: "0.5px",
                    opacity: loading ? 0.8 : 1
                  }}
                >
                  <span role="img" aria-label="announcement">📢</span> {loading ? "Submitting..." : "Send Announcement"}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Confirmation Modal */}
      <CModal visible={showConfirmModal} onClose={handleCancelSubmit} backdrop="static">
        <CModalHeader
          style={{
            background: "linear-gradient(90deg, #a259ff 0%, #6050dc 100%)",
            color: "white",
            border: "none",
          }}
        >
          <CModalTitle>Confirm</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center py-4" style={{ background: "#23232b", color: "#fff" }}>
          <p>Notification will be sent to all users</p>
        </CModalBody>
        <CModalFooter className="justify-content-center" style={{ background: "#23232b", border: "none" }}>
          <CButton
            style={{
              backgroundColor: "#45455a",
              borderColor: "#45455a",
              color: "white",
              minWidth: "80px"
            }}
            onClick={handleCancelSubmit}
            disabled={loading}
          >
            Cancel
          </CButton>
          <CButton
            style={{
              background: "linear-gradient(90deg, #a259ff 0%, #6050dc 100%)",
              borderColor: "#6050dc",
              color: "white",
              marginLeft: "16px",
              minWidth: "80px"
            }}
            onClick={handleConfirmSubmit}
            disabled={loading}
          >
            {loading ? "Sending..." : "OK"}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Announcement
