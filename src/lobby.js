'use strict';

let Room = require('./room');
let MessageBuilder = require('./message-builder');
let logger = require('nano-log').createLogger('LOBBY');

let constants = require('./constants');
let RoomType = constants.RoomType;
let ResultCode = constants.ResultCode;

class Lobby extends Room {
    constructor() {
        super(RoomType.LOBBY);
    }

    handleUserJoin(user, handleResult) {
        if (!user) return;

        if (this.checkUserJoined(user.id)) {
            let oldUser = this._users.get(user.id);
            let message = MessageBuilder.buildAuthResponse(ResultCode.SESSION_OVERRIDE, 0, 'Session is overrode');
            oldUser.sendMessage(message);
            this.removeUser(oldUser);
        }

        super.handleUserJoin(user, handleResult);
    }
}

module.exports = Lobby;