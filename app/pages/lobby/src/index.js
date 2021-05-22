import { constants } from "../../_shared/constants.js";
import LobbyController from "./controller.js";
import LobbySocketBuilder from "./util/lobbySocketBuilder.js";
import View from "./view.js";

const user = {
    img: 'https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png',
    username: 'Igor Torati' + Date.now()
}

const socketBuilder = new LobbySocketBuilder({
    socketUrl: constants.socketUrl,
    namespace: constants.socketNamespaces.lobby
})

const dependencies = {
    socketBuilder,
    user,
    view: View
}

LobbyController.initialize(dependencies).catch(error => {
    alert(error.message)
})