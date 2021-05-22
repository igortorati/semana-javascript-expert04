export const constants = {
    socketUrl: 'http://localhost:3000',
    socketNamespaces: {
        room: 'room',
        lobby: 'lobby'
    },
    peerConfig: Object.values({
        id: undefined,
    }),
    pages: {
        lobby: '/pages/lobby',
        login: '/pages/login'
    },
    events: {
        USER_CONNECTED: 'userConnection',
        USER_DISCONNECTED: 'userDisconnection',

        JOIN_ROOM: 'joinRoom',

        LOBBY_UPDATED: 'lobbyUpdated',
        UPGRADE_USER_PERMISSION: 'upgradeUserPermission',
        SPEAK_REQUEST: 'speakRequest',
        SPEAK_ANSWER: 'speakAnswer'
    },
    firebaseConfig: {
        apiKey: "AIzaSyBt68PCko6pt1-IFwoIE6Zt0AYTeK70DcQ",
        authDomain: "semana-jsexpert-f4df8.firebaseapp.com",
        projectId: "semana-jsexpert-f4df8",
        storageBucket: "semana-jsexpert-f4df8.appspot.com",
        messagingSenderId: "814335660686",
        appId: "1:814335660686:web:dccb1dcd90f09addd7efdf",
        measurementId: "G-ZGPHXBDPT3"
    },
    storageKey: 'jsexpert:storage:user'
}