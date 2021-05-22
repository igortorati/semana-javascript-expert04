import Attendee from "../entities/attendee.js"
import Room from "../entities/room.js"
import { constants } from "../util/constants.js"
import CustomMap from "../util/customMap.js"

export default class RoomsController {
    #users = new Map()

    constructor({roomsPubSub}) {
        this.roomsPubSub = roomsPubSub

        this.rooms = new CustomMap({
            observer: this.#roomObserver(),
            customMapper: this.#mapRoom.bind(this)//chama método mantendo o contexto atual
        })
    }

    #roomObserver() {
        return {
            notify: (rooms) => this.norifyRoomSubscribers(rooms)
        }
    }

    speakAnswer(socket, { answer, user }) {
        const userId = user.id
        const currentUser = this.#users.get(userId)
        const updatedUser = new Attendee({
            ...currentUser,
            isSpeaker: answer
        })
        this.#users.set(userId, updatedUser)

        const roomId = user.roomId
        const room = this.rooms.get(roomId)
        const userOnRoom = [...room.users.values()].find(({ id }) => id === userId)
        room.users.delete(userOnRoom)
        room.users.add(updatedUser)
        this.rooms.set(roomId, room)

        // Notifica o próprio usuário
        socket.emit(constants.event.UPGRADE_USER_PERMISSION, updatedUser)

        // Notifica a sala toda para ligar ao novo speaker
        this.#notifyUserProfileUpgrade(socket, roomId, updatedUser)
    }

    speakRequest(socket) {
        const userId = socket.id
        const user = this.#users.get(userId)
        const roomId = user.roomId
        const owner = this.rooms.get(roomId)?.owner
        socket.to(owner.id).emit(constants.event.SPEAK_REQUEST, user)
    }
    
    norifyRoomSubscribers(rooms) {
        const event = constants.event.LOBBY_UPDATED
        this.roomsPubSub.emit(event, [...rooms.values()])
    }

    onNewConnection(socket) {
        const { id } = socket
        console.log('connection stablished with', id)

        this.#updateGlobalUserData(id)
    }

    disconnect(socket) {
        console.log('disconnect!!', socket.id)
        this.#logoutUser(socket)
    }

    #logoutUser(socket) {
        const userId = socket.id
        const user = this.#users.get(userId)
        const roomId = user.roomId

        // remover user da lista de usuários ativos
        this.#users.delete(userId)
        
        // caso seja um usuário sujeira que estava em uma sala que não existe mais
        if(!this.rooms.has(roomId)) {
            return;
        } 

        const room = this.rooms.get(roomId)
        const toBeRemoved = [...room.users].find(({ id }) => id === userId)
        
        // Usuário removido da sala
        room.users.delete(toBeRemoved)

        // Se sala estiver vazia, deleta a sala
        if(!room.users.size) {
            this.rooms.delete(roomId)
            return;
        }
        
        // Checar se o usuário desconectado era o dono
        const disconnectedUserWasOwner = userId === room.owner.id
        const onlyOneUserLeft = room.users.size === 1

        // Validar se tem apenas um user ou se o user era o dono da sala
        if(onlyOneUserLeft || disconnectedUserWasOwner) {
            room.owner = this.#getNewRoomOwner(room, socket)
        }

        // atualiza a room após a troca
        this.rooms.set(roomId, room)

        // notifica a rede que o usuário se desconectou
        console.log(constants.event.USER_DISCONNECTED, " ", user)
        socket.to(roomId).emit(constants.event.USER_DISCONNECTED, user)
        console.log("Emitiu")
    }

    #notifyUserProfileUpgrade(socket, roomId, user) {
        socket.to(roomId).emit(constants.event.UPGRADE_USER_PERMISSION, user)
    }

    #getNewRoomOwner(room, socket) {
        const users = [...room.users.values()]
        const activeSpeakers = users.find(user => user.isSpeaker)

        // Se quem desconectou era dono, transfere a liderança para o speaker mais velho
        // ou para o attendee mais velho, caso não exista outros speakers
        const [newOwner] = activeSpeakers ? [activeSpeakers] : users
        newOwner.isSpeaker = true

        const outdatedUser = this.#users.get(newOwner.id)
        const updatedUser = new Attendee({
            ...outdatedUser,
            ...newOwner,
        })

        this.#users.set(newOwner.id, updatedUser)

        this.#notifyUserProfileUpgrade(socket, room.id, newOwner)

        return newOwner
    }

    joinRoom(socket, { user, room }) {
        const userId = user.id = socket.id
        const roomId = room.id

        const updatedUserData = this.#updateGlobalUserData(userId, user, roomId)

        const updatedRoom = this.#joinUserRoom(socket, updatedUserData, room)
        
        console.log({ updatedRoom })
        this.#notifyUsersOnRoom(socket, roomId, updatedUserData)
        this.#replyWithActiveUsers(socket, updatedRoom.users)
    }

    #replyWithActiveUsers(socket, users) {
        const event = constants.event.LOBBY_UPDATED
        socket.emit(event, [...users.values()])

    }

    #notifyUsersOnRoom(socket, roomId, user) {
        const event = constants.event.USER_CONNECTED
        socket.to(roomId).emit(event, user)
    }

    #joinUserRoom(socket, user, room) {
        const roomId = room.id
        const existingRoom = this.rooms.has(roomId)

        const currentRoom = existingRoom ? this.rooms.get(roomId) : {}
        const currentUser = new Attendee({
            ...user,
            roomId
        })
        
        //definindo dono da sala
        const [owner, users] = existingRoom ?
            [currentRoom.owner, currentRoom.users] :
            [currentUser, new Set()]
        
        const updatedRoom = this.#mapRoom({
            ...currentRoom,
            ...room,
            owner,
            users: new Set([...users, ...[currentUser]])
        })

        this.rooms.set(roomId, updatedRoom)
        socket.join(roomId)

        return this.rooms.get(roomId)
    }

    #mapRoom(room) {
        const users = [...room.users.values()]
        const speakersCount = users.filter(user => user.isSpeaker).length
        const featuredAttendees = users.slice(0, 3)
        const mappedRoom = new Room({
            ...room,
            featuredAttendees,
            speakersCount,
            attendeesCount: room.users.size
        })

        return mappedRoom
    }

    #updateGlobalUserData(userId, userData = {}, roomId = '') {
        const user = this.#users.get(userId) ?? {}
        const existingRoom = this.rooms.has(roomId)

        const updatedUserData = new Attendee({
            ...user,
            ...userData,
            roomId,
            isSpeaker: !existingRoom,
        })

        this.#users.set(userId, updatedUserData)

        return this.#users.get(userId)
    }

    getEvents() {
        const functions = Reflect.ownKeys(RoomsController.prototype)
        .filter(fn => fn !== 'constructor')
        .map(name => [name, this[name].bind(this)])

        return new Map(functions)
    }
}