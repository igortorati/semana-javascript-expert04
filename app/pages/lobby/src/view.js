const roomGrid = document.getElementById('roomGrid')
const btnCreateRoomWithTopic = document.getElementById('btnCreateRoomWithTopic')
const btnCreateRoomWithoutTopic = document.getElementById('btnCreateRoomWithoutTopic')
const txtTopic = document.getElementById('txtTopic')
const imgUser = document.getElementById('imgUser')

import { constants } from "../../_shared/constants.js"
import Room from "./entities/room.js"
import getTemplate from "./templates/lobbyItem.js"

export default class View {
    static clearRoomList() {
        roomGrid.innerHTML = ''
    }

    static redirectToLogin() {
        window.location = constants.pages.login
    }

    static generateRoomLink({ id, topic }) {
        return `./../room/index.html?id=${id}&topic=${topic}`
    }

    static redirectToRoom(topic = '') {
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2)
        window.location = View.generateRoomLink({
            id,
            topic
        })
    }

    static configureCreateRoomButton() {
        btnCreateRoomWithoutTopic.addEventListener('click', () => {
            View.redirectToRoom()
        })
        btnCreateRoomWithTopic.addEventListener('click', () => {
            const topic = txtTopic.value
            View.redirectToRoom(topic)
        })
    }

    static updateRoomList(rooms) {
        View.clearRoomList()

        rooms.forEach(room => {
            const params = new Room({
                ...room,
                roomLink: View.generateRoomLink(room)
            })

            const htmlTemplate = getTemplate(params)
            roomGrid.innerHTML += htmlTemplate
        })
    }

    static updateUserImage({ img, username }) {
        imgUser.src = img
        imgUser.al = username
    }
}