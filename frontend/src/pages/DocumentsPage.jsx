import React, { useEffect, useState } from 'react'
import { FileText, Download, CheckCircle, XCircle, Eye, Filter, Search, Calendar, User, AlertCircle } from 'lucide-react'
import { useApp, api } from '../context/AppContext'  // ✅ Fixed: import api from AppContext
import toast from 'react-hot-toast'

// ✅ Helper: format file size on the frontend (replaces Laravel accessor)
function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
// Storage URL: Laravel serves public storage at /storage/...
function storageUrl(path) {
  const base = API_BASE.replace('/api', '')
  return `${base}/storage/${path}`
}

export default function DocumentsPage() {
  const { lang, user, isManager } = useApp()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  // ✅ Guard: manager only
  if (!isManager) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500 dark:text-stone-400">
        Access denied. Manager only.
      </div>
    )
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/documents')
      setDocuments(res.data.data || res.data)
    } catch (error) {
      toast.error('Failed to load documents')
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (docId) => {
    setActionLoading(docId + '-verify')
    try {
      await api.patch(`/documents/${docId}/verify`, { verified_by: user.id })
      setDocuments(prev =>
        prev.map(d => d.id === docId ? { ...d, status: 'verified', verified_at: new Date().toISOString() } : d)
      )
      setSelectedDoc(null)
      toast.success('Document verified successfully')
    } catch (error) {
      toast.error('Failed to verify document')
      console.error('Error verifying document:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setActionLoading(rejectModal.id + '-reject')
    try {
      await api.patch(`/documents/${rejectModal.id}/reject`, { reason: rejectReason })
      setDocuments(prev =>
        prev.map(d => d.id === rejectModal.id ? { ...d, status: 'rejected', rejection_reason: rejectReason } : d)
      )
      setRejectModal(null)
      setRejectReason('')
      toast.success('Document rejected')
    } catch (error) {
      toast.error('Failed to reject document')
      console.error('Error rejecting document:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // ✅ Fixed: use correct storage URL (absolute URL with backend origin)
  const handleDownload = (doc) => {
    const url = storageUrl(doc.file_path)
    const link = document.createElement('a')
    link.href = url
    link.download = doc.file_name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.status === filter
    const matchesSearch =
      search === '' ||
      doc.file_name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.user?.email?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // ✅ Tailwind classes instead of undefined CSS utility classes
  const statusStyles = {
    pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  const statusIcons = {
    pending:  <AlertCircle size={14} className="text-yellow-500" />,
    verified: <CheckCircle size={14} className="text-emerald-500" />,
    rejected: <XCircle size={14} className="text-red-500" />,
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <div className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
            {lang === 'fr' ? 'Documents des Clients' : 'Client Documents'}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            {lang === 'fr'
              ? 'Vérifier et approuver les documents téléchargés par les clients'
              : 'Review and approve documents uploaded by clients'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search size={18} className="text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder={lang === 'fr' ? 'Rechercher par nom, email...' : 'Search by name, email...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 sm:w-64 px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-stone-400 shrink-0" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="flex-1 sm:w-40 px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">{lang === 'fr' ? 'Tous les statuts' : 'All Status'}</option>
              <option value="pending">{lang === 'fr' ? 'En attente' : 'Pending'}</option>
              <option value="verified">{lang === 'fr' ? 'Vérifié' : 'Verified'}</option>
              <option value="rejected">{lang === 'fr' ? 'Rejeté' : 'Rejected'}</option>
            </select>
          </div>
          <div className="text-sm text-stone-500 dark:text-stone-400 shrink-0">
            {filteredDocs.length} {lang === 'fr' ? 'document(s)' : 'document(s)'}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-12 text-center">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-stone-500">{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-12 text-center">
            <FileText size={48} className="text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <p className="text-stone-500 dark:text-stone-400">
              {lang === 'fr' ? 'Aucun document trouvé' : 'No documents found'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                    {['Document', lang === 'fr' ? 'Client' : 'Client', 'Type',
                      lang === 'fr' ? 'Taille' : 'Size',
                      'Date',
                      lang === 'fr' ? 'Statut' : 'Status',
                      'Actions'].map(h => (
                      <th key={h} className={`py-3 px-4 text-xs font-medium text-stone-400 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                      {/* File name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate max-w-[180px]">
                              {doc.file_name}
                            </p>
                            <p className="text-xs text-stone-400">{doc.mime_type}</p>
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {doc.user?.avatar ? (
                            <img src={doc.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center">
                              <User size={14} className="text-stone-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{doc.user?.name || '—'}</p>
                            <p className="text-xs text-stone-400">{doc.user?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="text-sm text-stone-600 dark:text-stone-400 capitalize">
                          {doc.type?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Size — ✅ computed on frontend */}
                      <td className="py-3 px-4">
                        <span className="text-sm text-stone-600 dark:text-stone-400">
                          {formatSize(doc.file_size)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
                          <Calendar size={14} />
                          {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[doc.status]}`}>
                          {statusIcons[doc.status]}
                          {doc.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-2 text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30"
                            title={lang === 'fr' ? 'Voir' : 'View'}
                          >
                            <Eye size={16} />
                          </button>

                          {/* Download */}
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30"
                            title={lang === 'fr' ? 'Télécharger' : 'Download'}
                          >
                            <Download size={16} />
                          </button>

                          {/* Verify / Reject — only for pending */}
                          {doc.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerify(doc.id)}
                                disabled={actionLoading === doc.id + '-verify'}
                                className="p-2 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 disabled:opacity-50"
                                title={lang === 'fr' ? 'Approuver' : 'Approve'}
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => setRejectModal(doc)}
                                disabled={actionLoading === doc.id + '-reject'}
                                className="p-2 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                                title={lang === 'fr' ? 'Rejeter' : 'Reject'}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white dark:bg-stone-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">{selectedDoc.file_name}</h3>
                <p className="text-xs text-stone-400 mt-0.5">{selectedDoc.user?.name} · {selectedDoc.type?.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <Download size={14} />
                  {lang === 'fr' ? 'Télécharger' : 'Download'}
                </button>
                {selectedDoc.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleVerify(selectedDoc.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle size={14} />
                      {lang === 'fr' ? 'Approuver' : 'Approve'}
                    </button>
                    <button
                      onClick={() => { setRejectModal(selectedDoc); setSelectedDoc(null) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <XCircle size={14} />
                      {lang === 'fr' ? 'Rejeter' : 'Reject'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {selectedDoc.mime_type?.includes('image') ? (
                <img
                  src={storageUrl(selectedDoc.file_path)}
                  alt={selectedDoc.file_name}
                  className="max-w-full h-auto mx-auto rounded-lg"
                />
              ) : selectedDoc.mime_type?.includes('pdf') ? (
                <iframe
                  src={storageUrl(selectedDoc.file_path)}
                  className="w-full h-[600px] rounded-lg"
                  title={selectedDoc.file_name}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} className="text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                  <p className="text-stone-500 mb-4">
                    {lang === 'fr' ? 'Aperçu non disponible' : 'Preview not available'}
                  </p>
                  <button
                    onClick={() => handleDownload(selectedDoc)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                  >
                    {lang === 'fr' ? 'Télécharger' : 'Download'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => { setRejectModal(null); setRejectReason('') }}
        >
          <div
            className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
              {lang === 'fr' ? 'Rejeter le document' : 'Reject Document'}
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              <span className="font-medium">{rejectModal.file_name}</span>
              {' '}— {lang === 'fr' ? 'Veuillez indiquer la raison du rejet' : 'Please provide a reason for rejection'}
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder={lang === 'fr' ? 'Raison du rejet...' : 'Rejection reason...'}
              className="w-full h-32 resize-none px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              >
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectModal.id + '-reject'}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModal.id + '-reject'
                  ? (lang === 'fr' ? 'Rejet...' : 'Rejecting...')
                  : (lang === 'fr' ? 'Rejeter' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
