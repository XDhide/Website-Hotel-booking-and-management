import { SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'
import Modal from './Modal'

import '../../assets/css/Adminpage/RoomManager.css'


interface Room {
    id : number
    name : string
    status : "inUse" | "notUse" | "canUse"
    bed : number
}
const mockRoom: Room[] = [
    { id: 1, name: "Phòng 101", status: "inUse", bed: 2 },
    { id: 2, name: "Phòng 102", status: "canUse", bed: 1 },
    { id: 3, name: "Phòng 103", status: "notUse", bed: 3 },
    { id: 4, name: "Phòng 104", status: "inUse", bed: 2 },
    { id: 5, name: "Phòng 105", status: "canUse", bed: 1 },
    { id: 6, name: "Phòng 106", status: "notUse", bed: 4 },
    { id: 7, name: "Phòng 201", status: "inUse", bed: 2 },
    { id: 8, name: "Phòng 202", status: "canUse", bed: 2 },
    { id: 9, name: "Phòng 203", status: "notUse", bed: 1 },
    { id: 10, name: "Phòng 204", status: "inUse", bed: 3 }
]



export default function RoomManager() {
    const [search, setSearch]   = useState('')
    const [modalMode, setModalMode] = useState<'open' | null>(null)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [editStatus, setEditStatus] = useState<Room["status"] | null>(null)
    const [rooms, setRooms] = useState<Room[]>(mockRoom)


    const statusLabel = {
        inUse: "Đang sử dụng",
        canUse: "Bảo trì",
        notUse: "Sẵn sàng"
    }


    const handleSave = () => {
        if (!selectedRoom || !editStatus) return

        const updatedRooms = rooms.map(room =>
            room.id === selectedRoom.id
                ? { ...room, status: editStatus }
                : room
        )

        setRooms(updatedRooms)

        setModalMode(null)
        setSelectedRoom(null)
    }
    const openModule = (room: Room) => {
        setSelectedRoom(room)
        setEditStatus(room.status)
        setModalMode('open')
    }
    const getStatusColor = (status: Room["status"]) => {
        switch (status) {
            case "inUse":
                return "red"
            case "notUse":
                return "green"
            case "canUse":
                return "yellow"
            default:
                return "black"
        }
    }

    return (
    <div className="room-manager-wapper">
        <div className="room-manager-header">
            <div className="search-box">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={e => { setSearch(e.target.value); }}
              />
            </div>
        </div>
        <div className='room-manager-body'>
            <div className='body-manager'>

                {rooms.map(room => (
                    <div className='body-manager-room' onClick={() => {openModule(room)}}>
                        <div className='body-left-manager-name'> {room.name}</div>
                        <div className='body-left-manager-status' style={{backgroundColor : getStatusColor(room.status)}} >
                        </div>                    
                    </div>
                ))}
            </div>

        </div>
            {modalMode && selectedRoom && (
                <Modal
                    title="Thông tin phòng"
                    onClose={() => {
                        setModalMode(null)
                        setSelectedRoom(null)
                    }}
                    onSave={handleSave}
                >
                    <div className='form-value'>
                        <div className='form-value-notchange'>ID: {selectedRoom.id}</div>
                        <div className='form-value-notchange'>Tên: {selectedRoom.name}</div>
                        <div className='form-value-notchange'>Số giường: {selectedRoom.bed}</div>

                        <div className='form-value-notchange'>
                            Trạng thái: {statusLabel[selectedRoom.status]}
                            
                        </div>
                        {editStatus === 'notUse' && (
                            <button onClick={() => setEditStatus('inUse') } style={{backgroundColor : 'green'}} className='inout-btn'>
                                Checkin
                            </button>
                        )}

                        {editStatus === 'inUse' && (
                            <button onClick={() => setEditStatus('notUse')} style={{backgroundColor : 'red'}} className='inout-btn'>
                                Checkout
                            </button>
                        )}
                    </div>
                </Modal>
            )}
    </div>
    )
    
}