/**
 * frontend/src/utils/uploadDocument.js
 *
 * Helper dédié pour l'upload de fichiers vers POST /api/documents.
 *
 * Pourquoi ce fichier existe :
 * L'instance `api` dans AppContext a un header global `Content-Type: application/json`.
 * Pour un upload de fichier, il faut `multipart/form-data`. Si on utilise api.post()
 * sans override, axios envoie "[object FormData]" en JSON → 422 côté Laravel.
 * En passant `Content-Type: undefined`, on laisse axios générer automatiquement
 * le bon `multipart/form-data; boundary=...`.
 */

import { api } from '../context/AppContext'

/**
 * Upload un document vers le backend.
 *
 * @param {File}   file  - Objet File provenant d'un <input type="file"> ou drag-and-drop
 * @param {string} type  - 'drivers_license' | 'passport' | 'id_card' | 'proof_of_address'
 * @returns {Promise<object>} L'objet document retourné par l'API
 * @throws Si la requête échoue (422, 500, etc.)
 */
export async function uploadDocument(file, type) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  // Ne pas append user_id — le backend le lit depuis $request->user() (token Sanctum)

  const res = await api.post('/documents', formData, {
    headers: {
      // undefined permet à axios de générer le bon boundary multipart automatiquement
      'Content-Type': undefined,
    },
  })

  return res.data.data || res.data
}

/**
 * Supprimer un document via DELETE /api/documents/{id}
 *
 * @param {number} documentId
 * @returns {Promise<void>}
 */
export async function deleteDocument(documentId) {
  await api.delete(`/documents/${documentId}`)
}
