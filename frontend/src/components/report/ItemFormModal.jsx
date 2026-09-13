import { useState } from 'react'

import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FormField } from '../common/FormField'

export function ItemFormModal({ title, initialItem, withKeyFlag, keyLabel, onSave, onClose }) {
  const [text, setText] = useState(initialItem?.text || '')
  const [isKey, setIsKey] = useState(initialItem?.isKey || false)
  const [error, setError] = useState('')

  function handleSave() {
    if (!text.trim()) {
      setError('This field is required')
      return
    }
    onSave({ text, isKey })
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="px-4">
            Cancel
          </Button>
          <Button onClick={handleSave} className="px-4">
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <FormField label="Description" id="item-text" value={text} onChange={(event) => setText(event.target.value)} error={error} />
        {withKeyFlag && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={isKey} onChange={(event) => setIsKey(event.target.checked)} />
            {keyLabel || 'Flag as key item'}
          </label>
        )}
      </div>
    </Modal>
  )
}
