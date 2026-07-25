import { useCallback, useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * Drag-and-drop PDF uploader.
 * @param {function} onFile - called with the chosen File object
 * @param {File|null} file  - currently selected file (controlled)
 */
export default function DropZone({ onFile, file }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const validate = (f) => {
    if (!f) return 'No file selected.'
    if (f.type !== 'application/pdf') return 'Only PDF files are accepted.'
    if (f.size > MAX_FILE_SIZE) return 'File must be smaller than 5 MB.'
    return ''
  }

  const handleFile = useCallback((f) => {
    const err = validate(f)
    setError(err)
    if (!err) onFile(f)
  }, [onFile])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    handleFile(dropped)
  }

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const onInputChange = (e) => {
    handleFile(e.target.files[0])
    e.target.value = '' // allow re-selecting same file
  }

  return (
    <div className="space-y-2">
      {/* Drop area */}
      <label
        id="resume-dropzone"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative flex flex-col items-center justify-center gap-4
          border-2 border-dashed rounded-2xl p-10 cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'drop-zone-active'
            : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 bg-navy-800/40'
          }
        `}
      >
        <input
          id="resume-file-input"
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={onInputChange}
        />

        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
          ${file ? 'bg-emerald-500/15' : 'bg-indigo-500/10'} transition-colors duration-200`}>
          {file ? (
            /* Checkmark */
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            /* Upload cloud */
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.25 5.25 0 011.517 10.195H6.75z" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          {file ? (
            <>
              <p className="font-display font-semibold text-emerald-300 text-base">{file.name}</p>
              <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
            </>
          ) : (
            <>
              <p className="font-display font-semibold text-slate-200 text-base">
                Drop your resume PDF here
              </p>
              <p className="text-sm text-slate-500 mt-1">
                or <span className="text-indigo-400 underline underline-offset-2">browse files</span> · Max 5 MB
              </p>
            </>
          )}
        </div>
      </label>

      {/* Error */}
      {error && (
        <p id="dropzone-error" className="flex items-center gap-1.5 text-sm text-rose-400 px-1 animate-fade-in">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
