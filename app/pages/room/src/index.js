import { constants } from "../../_shared/constants.js"
import RoomSocketBuilder from "./util/roomSocket.js"

const socketBuilder = new RoomSocketBuilder({
    socketUrl: constants.socketUrl,
    namespace: constants.socketNamespaces.room
})

const socket = socketBuilder
    .setOnUserConnected((user) => console.log('user connected!', user))
    .setOnUserDisconnected((user) => console.log('user disconnected!', user))
    .setOnRoomUpdated((room) => console.log('room list!', room))
    .build()


const room = {
    id: '0001',
    topic: 'JS Exper aula 01'
}

const user = {
    img: 'https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png',
    username: 'Igor Torati' + Date.now()
}

socket.emit(constants.events.JOIN_ROOM, { user, room })