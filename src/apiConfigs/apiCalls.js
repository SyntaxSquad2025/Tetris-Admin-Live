import axios from "axios"
import CryptoJS from "crypto-js"

// ✅ Base API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
console.log("API_BASE_URL:", API_BASE_URL)

// Function to encrypt the secret key with a timestamp
export const encryptSecretKey = (key, timestamp) => {
  // console.log(typeof timestamp)

  const payloadToEncrypt = `${key}&TimeStamp=${timestamp}`
  const encrypted = CryptoJS.AES.encrypt(payloadToEncrypt, key).toString()
  return encrypted
}

// ✅ Auth Headers
const getAuthHeaders = (key) => {
  const token = localStorage.getItem("token") // Retrieving token from localStorage
  // console.log(key, "keys")

  return {
    "Content-Type": "application/json", // Setting content-type to JSON
    ...(token && { Authorization: `Bearer ${token}`, clientid: key }), // Including token in Authorization header if it exists
  }
}

// ✅ Generic GET Request
export const getData = async (endpoint, params = {}) => {
  try {
    const clientid = encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())
    // console.log(clientid, "clientid clientid")

    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())),
      params, // Including query params if any
    })

    console.log("GET Response:", response)
    return response.data // Returning response data from the API
  } catch (error) {
    console.error("GET Error catch:", error.response || error)
    throw error // Throwing error in case of failure
  }
}

// ✅ GET by ID or path param
export const getById = async (endpointWithId) => {
  const clientid = encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())
  try {
    const response = await axios.get(`${API_BASE_URL}${endpointWithId}`, {
      headers: getAuthHeaders(encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())),
      clientid: clientid,
    })
    console.log("GET by ID Response:", response.data)
    return response.data // Returning response data from the API
  } catch (error) {
    console.error("GET by ID Error:", error.response || error)
    throw error // Throwing error in case of failure
  }
}

// ✅ Generic POST Request
export const postData = async (endpoint, data = {}) => {
  const clientid = encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())
  try {
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
      headers: getAuthHeaders(encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())),
      clientid: clientid,
    })
    console.log("POST Response:", response.data)
    return response.data // Returning response data from the API
  } catch (error) {
    console.error("POST Error:", error.response || error)
    throw error // Throwing error in case of failure
  }
}

// ✅ Generic PUT Request
export const putData = async (endpoint, data = {}) => {
  const clientid = encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())
  try {
    const response = await axios.put(`${API_BASE_URL}${endpoint}`, data, {
      headers: getAuthHeaders(encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())),
      clientid: clientid,
    })
    console.log("PUT Response:", response.data)
    return response.data // Returning response data from the API
  } catch (error) {
    console.error("PUT Error:", error.response || error)
    throw error // Throwing error in case of failure
  }
}

// ✅ Generic DELETE Request
export const deleteData = async (endpoint, params = {}) => {
  const clientid = encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())
  try {
    const response = await axios.delete(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(encryptSecretKey(import.meta.env.VITE_SECRET_SW_KEY, new Date().getTime())),
      clientid: clientid,
      params, // Including query params if any
    })
    console.log("DELETE Response:", response.data)
    return response.data // Returning response data from the API
  } catch (error) {
    console.error("DELETE Error:", error.response || error)
    throw error // Throwing error in case of failure
  }
}
