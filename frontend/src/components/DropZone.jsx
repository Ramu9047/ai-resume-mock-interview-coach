import { useCallback, useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * Drag-and-drop PDF uploader for Precision Dark Linear Theme.
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
    e.target.value = ''
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
          border-2 border-dashed rounded-lg p-8 sm:p-10 cursor-pointer
          transition-all duration-150
          ${dragging
            ? 'border-[#FF5A1F] bg-[#FF5A1F]/5 shadow-sm'
            : file
              ? 'border-[#FF5A1F] bg-[#FF5A1F]/5'
              : 'border-[#26262B] hover:border-[#3D3D42] bg-[#1B1B1F] hover:bg-[#212126]'
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
        <div className={`w-12 h-12 rounded-md flex items-center justify-center
          ${file ? 'bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/30' : 'bg-[#131316] text-[#FF5A1F] border border-[#26262B]'} transition-colors duration-150 shadow-xs`}>
          {file ? (
            /* Checkmark */
            <svg className="w-6 h-6 text-[#FF5A1F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            /* Upload cloud */
            <svg className="w-6 h-6 text-[#FF5A1F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.25 5.25 0 011.517 10.195H6.75z" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          {file ? (
            <>
              <p className="font-display font-bold text-[#F5F5F3] text-base">{file.name}</p>
              <p className="text-xs text-[#8A8A8F] mt-1 font-mono font-bold">{(file.size / 1024).toFixed(1)} KB · Click to replace file</p>
            </>
          ) : (
            <>
              <p className="font-display font-bold text-[#F5F5F3] text-base">
                Drop your resume PDF here
              </p>
              <p className="text-sm text-[#8A8A8F] mt-1 font-sans">
                or <span className="text-[#FF5A1F] font-bold underline underline-offset-2">browse files</span> · Max 5 MB
              </p>
            </>
          )}
        </div>
      </label>

      {/* Error */}
      {error && (
        <p id="dropzone-error" className="flex items-center gap-1.5 text-xs font-bold text-[#F04438] px-1 animate-fade-in font-mono">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
