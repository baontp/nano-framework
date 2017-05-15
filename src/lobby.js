'use strict';

let Domain = require('./domain');
let LobbyAdaptor = require('./lobby-adaptor');
let MessageBuilder = require('./message-builder');
let log = require('nano-log');
let EE = require('events');
let uti = require('./util');

let constants = require('./constants');
let RoomType = constants.RoomType;
let ResultCode = constants.ResultCode;
let NotifyType = constants.NotifyType;

class Lobby extends Domain {
    constructor(server) {
        super();

        this._server = server;
        this._roomMap = new Map();
        this._adaptor = new LobbyAdaptor(this);
        this._emitter = new EE();

        this._logger = log.createLogger('LOBBY');
        this._logger.prefix = `${this._id}`;
    }

    get emitter(){ return this._emitter; }

    get id() { return this._id};
    set id(id){ this._id = id; this._logger.prefix = `${this._id}`; }

    get adaptor() { return this._adaptor };
    set adaptor(adaptor) { this._adaptor = adaptor };

    get logger(){ return this._logger};

    createRoom(type, maxUser) {
        let room = this._server.roomFactory.createRoom(type);
        room.maxUser = !!maxUser ? maxUser : room.maxUser;
        this._emitter.emit('room-created', room);
        this._roomMap.set(room.id, room);
        return room;
    }

    findRoom(roomId) {
        if (this._roomMap.size <= 0) return null;

        if (!!roomId) {
            return this._roomMap.get(roomId);
        } else {
            let entry = this._roomMap.entries().next();
            return entry.done ? null : entry.value[1];
        }
    }

    handleUserJoin(user, handleResult) {
        if (!user) return;

        let oldUser = this.findUserByName(user.name);
        if (!!oldUser) {
            logger.warn('Session is overrode by', user.name);
            let message = MessageBuilder.buildAuthResponse(ResultCode.SESSION_OVERRIDE, 0, 'Session is overrode');
            oldUser.sendMessage(message);
            this.removeUser(oldUser);
        }

        if(this.isFull) {
            handleResult.code = ResultCode.REQUEST_FAILED;
            handleResult.msg = 'Lobby is full';
            return;
        }

        this._adaptor.handleUserJoin(user, handleResult);
        if(handleResult.code != ResultCode.SUCCESS) {
            return;
        }

        this.addUser(user, false);
        if(!handleResult.skipNotify) {
            this.broadcast(this._buildJoinLeaveNotify(user, true));
        }

    }

    handleUserLeave(user, handleResult) {
        if (!user) return;

        if(!this.checkUserJoined(user)) {
            handleResult.code = ResultCode.REQUEST_FAILED;
            return;
        }

        this._adaptor.onUserLeft(user);
        this.removeUser(user, false);
        if(!handleResult.skipNotify) {
            this.broadcast(this._buildJoinLeaveNotify(user, false));
        }
    }

    handleSessionPaused(user, handleResult) {
    }

    handleSessionResumed(user, handleResult) {
    }

    handleSessionClosed(user) {
        if (!user) return;
        if (!!user.hasCleanUp) return;

        user.cleanUp();
        this._adaptor.onUserLeft(user);
        this.removeUser(user, true);
    }

    addUser(user, notify) {
        if (this._addUser(user)) {
            user._lobby = this;
            if (notify) {
                this.broadcast(this._buildJoinLeaveNotify(user, true));
            }
            return true;
        }
        return false;
    }

    removeUser(user, notify) {
        if (this._removeUser(user)) {
            user._lobby = null;
            if (notify) {
                this.broadcast(this._buildJoinLeaveNotify(user, false));
            }
            user.room && user.room.onUserLeft(user);
            return true;
        }
        return false;
    }


    _buildJoinLeaveNotify(user, isJoin) {
        let payload = {
            i: this.id,
            o: this.owner,
            n: this.name,
            m: this.maxUser,
            u: user.name
        };
        return MessageBuilder.buildNotify(isJoin ? NotifyType.USER_JOINED_LOBBY : NotifyType.USER_LEFT_LOBBY, payload);
    }
}

module.exports = Lobby;