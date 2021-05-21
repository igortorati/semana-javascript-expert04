import { constants } from "../../_shared/constants.js"
import RoomController from "./controller.js"
import RoomSocketBuilder from "./util/roomSocket.js"
import View from "./view.js"

const socketBuilder = new RoomSocketBuilder({
    socketUrl: constants.socketUrl,
    namespace: constants.socketNamespaces.room
})

const urlParams = new URLSearchParams(window.location.search)
const keys = ['id', 'topic']
const urlData = keys.map((key) => [key, urlParams.get(key)])


const room = {
    id: '0001',
    topic: 'JS Exper aula 01'
}

const user = {
    img: 'https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png',
    username: 'Igor Torati' + Date.now()
}

const roomInfo = {
    room: { ...Object.fromEntries(urlData) },
    user
}

const dependencies = {
    view: View,
    socketBuilder,
    roomInfo
}

await RoomController.initialize(dependencies)

