import { constants } from "../../_shared/constants.js"
import Attendee from "./entities/attendee.js"

export default class RoomController {
    constructor({ roomInfo, socketBuilder, view, peerBuilder, roomService }) {
        this.socketBuilder = socketBuilder
        this.peerBuilder = peerBuilder
        this.roomInfo = roomInfo
        this.view = view
        this.roomService = roomService

        this.socket = {}
    }

    static async initialize(deps) { // evita o uso do new onde for utilizar essa variável
        return new RoomController(deps)._initialize()
    }

    async _initialize() {
        this._setupViewEvent()
        this.roomService.init()
        this.socket = this._setupSocket()
        this.roomService.setCurrentPeer(await this._setupWebRTC())
    }

    _setupViewEvent() {
        this.view.updateUserImage(this.roomInfo.user)
        this.view.updateRoomTopic(this.roomInfo.room)
    }

    _setupSocket() {
        return this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onDisconnected())
            .setOnRoomUpdated(this.onRoomUpdated())
            .setOnUserProfileUpgrade(this.onUserProfileUpgrade())
            .build() // Poderiamos usar Façade ou Factory para evitar esquecer o build()
    }

    async _setupWebRTC() {
        return this.peerBuilder
            .setOnError(this.onPeerError())
            .setOnConnectionOpened(this.onPeerConnectionOpened())
            .setOnCallReceived(this.onCallReceived())
            .setOnCallError(this.onCallError())
            .setOnCallClose(this.onCallClose())
            .setOnStreamReceived(this.onStreamReceived())
            .build()
    }

    onStreamReceived() {
        return (call, stream) => { 
            const callerId = call.peer

            console.log('onStreamReceived', call, stream)
            const { isCurrentId } = this.roomService.addReceivedPeer(call)
            this.view.renderAudioElemtn({
                callerId,
                stream,
                isCurrentId
            })
        }
    }

    onCallClose() {
        return (call) => { 
            console.log('onCallClose', call)
            const peerId = call.peer
            this.roomService.disconnectPeer({ peerId })
        }
    }

    onCallError() {
        return (call, error) => { 
            console.log('onCallError', call, error)
            const peerId = call.peer
            this.roomService.disconnectPeer({ peerId })
        }
    }

    onCallReceived() {
        return async (call) => {
            const stream = await this.roomService.getCurrentStream()
            console.log('answering call', call)
            call.answer(stream)
        }
    }

    onPeerError() {
        return (error) => {
            console.log('deu ruim')
        }
    }

    // quando a conexão for aberta ele pede para entrar na sala
    onPeerConnectionOpened() {
        return (peer) => {
            console.log('peeeeeeer', peer)
            this.roomInfo.user.peerId = peer.id
            this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo)
        }
    }

    onUserProfileUpgrade() {
        return (data) => {
            const attendee = new Attendee(data)
            console.log('onUserProfileUpgrade', attendee)

            this.roomService.upgradeUserPermission(attendee)

            if(attendee.isSpeaker) {
                this.view.addAttendeeOnGrid(attendee, true)
            }

            this.activateUserFeatures()
        }
    }

    onRoomUpdated() {
        return (data) => {
            const users = data.map(item => new Attendee(item))
            this.view.updateAttendeesOnGrid(users)
            this.roomService.updateCurrentUserProfile(users)
            this.activateUserFeatures()
            console.log('room list!', users)
        }
    }

    onDisconnected() {
        return (data) => {
            const attendee = new Attendee(data)
            console.log(`${attendee.username} user disconnected!`)
            this.view.removeItemFromGrid(attendee.id)

            this.roomService.disconnectPeer(attendee)
        }
    }

    onUserConnected() {
        return (data) => {
            const attendee = new Attendee(data)
            console.log('user connected!', attendee)
            
            this.view.addAttendeeOnGrid(attendee)

            this.roomService.callNewUser(attendee)
        }
    }

    activateUserFeatures() {
        const currentUser = this.roomService.getCurrentUser()
        this.view.showUserFeatures(currentUser.isSpeaker)
    }
}