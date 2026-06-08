import { uploadDocument, deleteDocument } from '../utils/uploadDocument'
import React, { useState, useRef, useEffect } from 'react'
import { User, Camera, Lock, FileText, Upload, CheckCircle2, Eye, EyeOff, Trash2, AlertCircle } from 'lucide-react'
import { useApp, api } from '../context/AppContext'

export default function ProfilePage() {
  const { t, lang, user, updateProfile, addNotification } = useApp()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { key: 'profile', label: t.profile.title, icon: <User size={16} /> },
    { key: 'password', label: t.profile.password_title, icon: <Lock size={16} /> },
    { key: 'documents', label: t.profile.docs_title, icon: <FileText size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="section-title">{t.profile.title}</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="sm:w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    activeTab === tab.key
                      ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {tab.icon}{tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && <ProfileForm t={t} lang={lang} user={user} updateProfile={updateProfile} />}
            {activeTab === 'password' && <PasswordForm t={t} lang={lang} />}
            {activeTab === 'documents' && <DocumentsForm t={t} lang={lang} addNotification={addNotification} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ProfileForm — INCHANGÉ ──────────────────────────────────────────────────

function ProfileForm({ t, lang, user, updateProfile }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || '' })
  const [avatar, setAvatar] = useState(user.avatar)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({ ...form, avatar })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="card p-6 space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-stone-400" />
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 hover:bg-brand-700 rounded-full flex items-center justify-center text-white shadow transition-colors"
          >
            <Camera size={13} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">{user.name}</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">{user.email}</p>
          <button onClick={() => fileRef.current?.click()} className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-1">
            {t.profile.upload_avatar}
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label className="label">{t.profile.name}</label>
          <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input" />
        </div>
        <div>
          <label className="label">{t.profile.email}</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="input" />
        </div>
        <div>
          <label className="label">{t.profile.phone}</label>
          <input type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input" />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full sm:w-auto justify-center">
        {saving ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lang === 'fr' ? 'Sauvegarde…' : 'Saving…'}</span>
        ) : saved ? (
          <span className="flex items-center gap-2"><CheckCircle2 size={16} />{lang === 'fr' ? 'Sauvegardé!' : 'Saved!'}</span>
        ) : t.profile.save}
      </button>
    </div>
  )
}

// ─── PasswordForm — INCHANGÉ ─────────────────────────────────────────────────

function PasswordForm({ t, lang }) {
  const [form, setForm] = useState({ current: '', new: '', confirm: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')
    if (form.new !== form.confirm) { setError(lang === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'); return }
    if (form.new.length < 8) { setError(lang === 'fr' ? 'Minimum 8 caractères' : 'Minimum 8 characters'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    setForm({ current: '', new: '', confirm: '' })
    setTimeout(() => setSaved(false), 2500)
  }

  const PasswordInput = ({ field, label }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(p => ({...p, [field]: e.target.value}))}
          className="input pr-10"
        />
        <button type="button" onClick={() => setShow(p => ({...p, [field]: !p[field]}))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
          {show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="card p-6 space-y-4">
      <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t.profile.password_title}</h3>
      <PasswordInput field="current" label={t.profile.current_pw} />
      <PasswordInput field="new" label={t.profile.new_pw} />
      <PasswordInput field="confirm" label={t.profile.confirm_pw} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="btn-primary w-full sm:w-auto justify-center">
        {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</span>
        : saved ? <span className="flex items-center gap-2"><CheckCircle2 size={16} />Updated!</span>
        : t.profile.update_pw}
      </button>
    </div>
  )
}

// ─── DocumentsForm — MODIFIÉ ─────────────────────────────────────────────────
//
// Changements par rapport à l'original :
//   1. Chargement réel des documents depuis GET /api/documents au montage
//   2. Sélecteur de type (drivers_license, passport, id_card, proof_of_address)
//      requis par le backend — absent dans l'original
//   3. processFile appelle uploadDocument() au lieu de simuler un setTimeout
//   4. Suppression appelle deleteDocument() en plus du state local
//   5. Gestion d'erreur affichée à l'utilisateur

function DocumentsForm({ t, lang, addNotification }) {
  const [dragging, setDragging] = useState(false)
  const [docs, setDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  // ✅ Sélecteur de type — requis par le backend
  const [docType, setDocType] = useState('drivers_license')
  const fileRef = useRef(null)

  // ✅ Charger les documents existants depuis le backend au montage
  useEffect(() => {
    const fetchMyDocs = async () => {
      try {
        const res = await api.get('/documents')
        setDocs(res.data.data || res.data)
      } catch (err) {
        console.error('Failed to load documents', err)
      } finally {
        setLoadingDocs(false)
      }
    }
    fetchMyDocs()
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  // ✅ Upload réel via le helper — plus de faux setTimeout
  const processFile = async (file) => {
    setUploading(true)
    setUploadError('')
    try {
      const newDoc = await uploadDocument(file, docType)
      setDocs(prev => [newDoc, ...prev])
      addNotification({
        type: 'document',
        message: `${lang === 'fr' ? 'Nouveau document téléchargé' : 'New document uploaded'}: ${file.name}`,
      })
    } catch (err) {
      // Affiche le message d'erreur Laravel (ex: "The file field is required.")
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.file?.[0] ||
        err.response?.data?.errors?.type?.[0] ||
        (lang === 'fr' ? 'Échec du téléchargement' : 'Upload failed')
      setUploadError(msg)
      console.error('Upload error:', err.response?.data)
    } finally {
      setUploading(false)
    }
  }

  // ✅ Suppression réelle en base + mise à jour du state local
  const handleDelete = async (docId) => {
    try {
      await deleteDocument(docId)
      setDocs(prev => prev.filter(d => d.id !== docId))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const docTypeOptions = [
    { value: 'drivers_license', label: lang === 'fr' ? 'Permis de conduire' : "Driver's License" },
    { value: 'passport',        label: lang === 'fr' ? 'Passeport'          : 'Passport' },
    { value: 'id_card',         label: lang === 'fr' ? "Carte d'identité"   : 'ID Card' },
    { value: 'proof_of_address',label: lang === 'fr' ? 'Justificatif de domicile' : 'Proof of Address' },
  ]

  const statusStyles = {
    pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  const statusLabels = {
    pending:  lang === 'fr' ? 'En attente' : 'Pending',
    verified: lang === 'fr' ? 'Vérifié'    : 'Verified',
    rejected: lang === 'fr' ? 'Rejeté'     : 'Rejected',
  }

  return (
    <div className="card p-6 space-y-5">
      <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t.profile.upload_license}</h3>

      {/* ✅ Sélecteur de type de document */}
      <div>
        <label className="label">
          {lang === 'fr' ? 'Type de document' : 'Document type'}
        </label>
        <select
          value={docType}
          onChange={e => setDocType(e.target.value)}
          className="input"
        >
          {docTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragging
            ? 'drop-zone-active border-brand-400'
            : 'border-stone-300 dark:border-stone-700 hover:border-brand-400 dark:hover:border-brand-600'
        }`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-stone-500">
              {lang === 'fr' ? 'Téléchargement…' : 'Uploading…'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragging ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-stone-100 dark:bg-stone-800'}`}>
              <Upload size={22} className={dragging ? 'text-brand-600' : 'text-stone-400'} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{t.profile.drop_here}</p>
              <p className="text-xs text-stone-400 mt-1">{t.profile.file_types}</p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Erreur d'upload affichée proprement */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          {uploadError}
        </div>
      )}

      {/* ✅ Liste des documents chargés depuis le backend */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {lang === 'fr' ? 'Documents Téléchargés' : 'Uploaded Documents'}
        </h4>

        {loadingDocs ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl animate-pulse">
                <div className="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                  <div className="h-2.5 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4">
            {lang === 'fr' ? 'Aucun document téléchargé' : 'No documents uploaded yet'}
          </p>
        ) : (
          docs.map(doc => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                  {doc.file_name}
                </p>
                <p className="text-xs text-stone-400">
                  {/* ✅ formatted_size vient du backend (ou calculé en fallback) */}
                  {doc.formatted_size || (doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '')}
                  {' · '}
                  {doc.type?.replace(/_/g, ' ')}
                  {' · '}
                  {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}
                </p>
              </div>
              {/* Raison du rejet si applicable */}
              {doc.status === 'rejected' && doc.rejection_reason && (
                <span className="text-xs text-red-500 max-w-[120px] truncate" title={doc.rejection_reason}>
                  {doc.rejection_reason}
                </span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${statusStyles[doc.status] || statusStyles.pending}`}>
                {statusLabels[doc.status] || doc.status}
              </span>
              {/* ✅ Suppression réelle en base — seulement si pending ou rejected */}
              {doc.status !== 'verified' && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1 shrink-0"
                  title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
