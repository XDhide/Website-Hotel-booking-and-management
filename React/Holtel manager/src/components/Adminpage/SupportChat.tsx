import { useState } from 'react'
import { UserOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons'
import '../../assets/css/Adminpage/SupportChat.css'

interface User {
    id: number
    name: string
    avatar: string
    lastMessage: string
}

interface Message {
    id: number
    text: string
    sender: 'admin' | 'user'
    time: string
}

const mockUsers: User[] = [
    { id: 1, name: 'Nguyễn Dũng', avatar: 'ND', lastMessage: 'Xin chào, tôi cần hỗ trợ!' },
    { id: 2, name: 'Trần Linh', avatar: 'TL', lastMessage: 'Cảm ơn bạn nhiều!' },
    { id: 3, name: 'Lê Hương', avatar: 'LH', lastMessage: 'Vấn đề đã được giải quyết.' },
    { id: 4, name: 'Phạm Tuấn', avatar: 'PT', lastMessage: 'Tôi muốn hỏi phòng VIp.' },
    { id: 5, name: 'Hoàng Mai', avatar: 'HM', lastMessage: 'Khi nào thì trả phòng?' },
]

const mockMessages: Record<number, Message[]> = {
    1: [
        { id: 1, text: 'Xin chào, tôi cần hỗ trợ!', sender: 'user', time: '10:00' },
        { id: 2, text: 'Chào bạn! Mình có thể giúp gì cho bạn?', sender: 'admin', time: '10:01' },
    ],
    2: [
        { id: 1, text: 'Cảm ơn bạn nhiều!', sender: 'user', time: '09:30' },
        { id: 2, text: 'Không có gì, bạn cần thêm hỗ trợ cứ nhắn nhé!', sender: 'admin', time: '09:31' },
    ],
    3: [],
    4: [
        { id: 1, text: 'Tôi muốn hỏi về hóa đơn #1234.', sender: 'user', time: '11:00' },
    ],
    5: [
        { id: 1, text: 'Khi nào thì trả phòng vậy?', sender: 'user', time: '08:45' },
    ],
}

export default function SupportChat() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [messages, setMessages] = useState<Record<number, Message[]>>(mockMessages)
    const [inputText, setInputText] = useState('')

    const handleSelectUser = (user: User) => {
        setSelectedUser(user)
    }

    const handleSend = () => {
        if (!inputText.trim() || !selectedUser) return

        const now = new Date()
        const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`

        const newMessage: Message = {
            id: Date.now(),
            text: inputText.trim(),
            sender: 'admin',
            time,
        }

        setMessages(prev => ({
            ...prev,
            [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage],
        }))
        setInputText('')
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend()
    }

    const currentMessages = selectedUser ? (messages[selectedUser.id] || []) : []

    return (
        <div className="support-wapper">
            <div className="support-user-box">
                {mockUsers.map(user => (
                    <div
                        key={user.id}
                        className={`support-user-person ${selectedUser?.id === user.id ? 'active' : ''}`}
                        onClick={() => handleSelectUser(user)}
                    >
                        <div className="support-user-icon">
                            <UserOutlined className="support-user-avatar-icon" />
                        </div>
                        <div className="support-user-info">
                            <div className="support-user-name">{user.name}</div>
                            <div className="support-user-last-msg">{user.lastMessage}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="support-chat-box">
                {selectedUser ? (
                    <>
                        <div className="support-chat-header">
                            <div className="support-user-icon small">
                                <UserOutlined className="support-user-avatar-icon" />
                            </div>
                            <span className="support-chat-header-name">{selectedUser.name}</span>
                        </div>

                        <div className="support-chat-box-output">
                            {currentMessages.length === 0 && (
                                <div className="support-chat-empty">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>
                            )}
                            {currentMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`support-message-row ${msg.sender === 'admin' ? 'admin' : 'user'}`}
                                >
                                    <div className="support-message-bubble">
                                        <span>{msg.text}</span>
                                        <span className="support-message-time">{msg.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="support-chat-box-input">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button onClick={handleSend}><SendOutlined /> Gửi</button>
                        </div>
                    </>
                ) : (
                    <div className="support-chat-placeholder">
                        <MessageOutlined className="support-chat-placeholder-icon" />
                        <p>Chọn một người dùng để bắt đầu trò chuyện</p>
                    </div>
                )}
            </div>
        </div>
    )
}