'use client'

import { useState, useTransition } from 'react'
import { deleteImportSession, updateImportNote } from '../actions'
import { Trash2, Pencil, Check, X } from 'lucide-react'

export function ImportSessionActions({ sessionId, note }: { sessionId: string; note?: string | null }) {
  const [editing, setEditing] = useState(false)
  const [noteVal, setNoteVal] = useState(note ?? '')
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSaveNote() {
    startTransition(async () => {
      await updateImportNote(sessionId, noteVal)
      setEditing(false)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteImportSession(sessionId)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* Note edit */}
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            value={noteVal}
            onChange={e => setNoteVal(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
            placeholder="Ghi chú..."
            autoFocus
          />
          <button onClick={handleSaveNote} disabled={pending} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50">
            <Check size={16} />
          </button>
          <button onClick={() => { setEditing(false); setNoteVal(note ?? '') }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Pencil size={13} /> Sửa ghi chú
        </button>
      )}

      {/* Delete */}
      {!editing && (
        confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">Xóa phiếu và hoàn tồn kho?</span>
            <button onClick={handleDelete} disabled={pending} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50">
              {pending ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
            <button onClick={() => setConfirming(false)} className="px-3 py-1.5 text-gray-600 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              Hủy
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 size={13} /> Xóa phiếu
          </button>
        )
      )}
    </div>
  )
}
