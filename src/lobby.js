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

        if (this.checkUserJoined(user.name)) {
            let oldUser = this._users.get(user.name);
            let message = MessageBuilder.buildAuthResponse(ResultCode.SESSION_OVERRIDE, 0, 'Session is overrode');
            oldUser.send(message);
            this._removeUser(oldUser);
        }

        super.handleUserJoin(user, handleResult);
    }
}

module.exports = Lobby;