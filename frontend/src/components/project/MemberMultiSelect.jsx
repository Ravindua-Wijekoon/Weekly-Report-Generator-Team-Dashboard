import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function MemberMultiSelect({ members, selectedIds, onChange }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  function updatePosition() {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
  }

  function openDropdown() {
    updatePosition()
    setIsOpen(true)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        !event.target.closest('[data-member-dropdown]')
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined
    // The dropdown is portaled and fixed-position, so if the modal body (or the
    // page) scrolls while it's open, re-measure the input to keep it aligned.
    // The `true` (capture) is required to observe scroll on the modal's inner
    // scroll container, since scroll events don't bubble.
    window.addEventListener('resize', updatePosition)
    document.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen])

  const selectedMembers = members.filter((member) => selectedIds.includes(member.id))
  const availableMembers = members.filter((member) => !selectedIds.includes(member.id))
  const filteredMembers = availableMembers.filter((member) =>
    member.name.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(member) {
    onChange([...selectedIds, member.id])
    setQuery('')
  }

  function handleRemove(id) {
    onChange(selectedIds.filter((memberId) => memberId !== id))
  }

  return (
    <div ref={containerRef} className="relative">
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedMembers.map((member) => (
            <span
              key={member.id}
              className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-sm px-2 py-1 rounded-full"
            >
              {member.name}
              <button
                type="button"
                onClick={() => handleRemove(member.id)}
                className="hover:text-primary-900"
                aria-label={`Remove ${member.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          openDropdown()
        }}
        onFocus={openDropdown}
        placeholder={availableMembers.length === 0 ? 'All members assigned' : 'Search members...'}
        disabled={availableMembers.length === 0}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-400"
      />

      {isOpen &&
        filteredMembers.length > 0 &&
        position &&
        createPortal(
          <div
            data-member-dropdown
            style={{ position: 'fixed', top: position.top, left: position.left, width: position.width }}
            className="z-[200] bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
          >
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelect(member)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                {member.name}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}
