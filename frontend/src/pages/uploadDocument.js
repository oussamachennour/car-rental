/**
 * frontend/src/utils/uploadDocument.js
 */

import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ' https://backend-production.up.railway.app/api'

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  Accept: 'application/json',
  // Content-Type intentionally omitted — let axios set multipart/form-data with boundary
})

/**
 * Upload un document vers le backend.
 * @param {File}   file  - Fichier (input ou drag-and-drop)
 * @param {string} type  - 'drivers_license' | 'passport' | 'id_card' | 'proof_of_address'
 * @returns {Promise<object>} Document créé
 */
export async function uploadDocument(file, type) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  // user_id non requis — le backend le lit depuis $request->user()

  const res = await axios.post(`${BASE}/documents`, formData, {
    headers: authHeaders(),
  })

  return res.data.data || res.data
}

/**
 * Supprimer un document.
 * @param {number} documentId
 */
export async function deleteDocument(documentId) {
  await axios.delete(`${BASE}/documents/${documentId}`, {
    headers: authHeaders(),
  })
}