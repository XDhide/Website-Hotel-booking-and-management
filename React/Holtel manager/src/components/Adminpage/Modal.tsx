import type { ReactNode } from 'react'
import { CloseOutlined, SaveOutlined } from '@ant-design/icons'
import './Modal.css'

interface ModalProps {
  title: string
  onClose: () => void
  onSave: () => void
  children: ReactNode
}

export default function Modal({ title, onClose, onSave, children }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={onSave}><SaveOutlined /> Lưu</button>
        </div>
      </div>
    </div>
  )
}
