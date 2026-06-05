import React, { useState, useRef } from 'react'
import { User, Camera, Lock, FileText, Upload, CheckCircle2, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

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

function DocumentsForm({ t, lang, addNotification }) {
  const [dragging, setDragging] = useState(false)
  const [docs, setDocs] = useState([
    { id: 1, name: 'drivers_license_2024.pdf', size: '1.2 MB', status: 'verified', uploaded: '2024-03-15' }
  ])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const processFile = async (file) => {
    setUploading(true)
    await new Promise(r => setTimeout(r, 1500))
    const newDoc = { id: Date.now(), name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, status: 'pending', uploaded: new Date().toISOString().split('T')[0] }
    setDocs(p => [...p, newDoc])
    setUploading(false)
    addNotification({ type: 'document', message: `${lang === 'fr' ? 'Nouveau document téléchargé' : 'New document uploaded'}: ${file.name}` })
  }

  return (
    <div className="card p-6 space-y-5">
      <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t.profile.upload_license}</h3>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragging ? 'drop-zone-active border-brand-400' : 'border-stone-300 dark:border-stone-700 hover:border-brand-400 dark:hover:border-brand-600'
        }`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-stone-500">{lang === 'fr' ? 'Téléchargement…' : 'Uploading…'}</p>
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

      {/* Uploaded docs */}
      {docs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-stone-700 dark:text-stone-300">{lang === 'fr' ? 'Documents Téléchargés' : 'Uploaded Documents'}</h4>
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{doc.name}</p>
                <p className="text-xs text-stone-400">{doc.size} · {doc.uploaded}</p>
              </div>
              <span className={`badge ${doc.status === 'verified' ? 'badge-green' : 'badge-yellow'}`}>
                {doc.status === 'verified' ? (lang === 'fr' ? 'Vérifié' : 'Verified') : (lang === 'fr' ? 'En attente' : 'Pending')}
              </span>
              <button onClick={() => setDocs(p => p.filter(d => d.id !== doc.id))}
                className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
