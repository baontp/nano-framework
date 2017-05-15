'use strict';

let EventEmitter = require('events');
let util = require('./util');
let MessageBuilder = require('./message-builder');
let Domain = require('./domain');
let NotifyType = require('./constants').NotifyType;
let ResultCode = require('./constants').ResultCode;
let RoomAdaptor = require('./room-adaptor');
let log = require('nano-log');

class Room extends Domain {
    constructor(type) {
        super();
        this._owner = '';
        this._name = '';
        this._type = type;
        this._adaptor = new RoomAdaptor();

        this._logger = log.createLogger('ROOM');
        this._logger.prefix = `${this._id}`;
    }

    get id() { return this._id};
    set id(id){ this._id = id; this._logger.prefix = `${this._id}`; }

    get type() { return this._type};
    get server() { return this._server};

    get owner(){ return this._owner};
    set owner(owner){ this._owner = owner};

    get name(){ return this._name};
    set name(name){ this._name = name};

    get adaptor(){ return this._adaptor};
    set adaptor(adaptor){ this._adaptor = adaptor};

    get logger(){ return this._logger};

    handleUserJoin(user, handleResult) {
        if (!user) return;

        if(this.checkUserJoined(user)) {
            handleResult.code = ResultCode.REQUEST_FAILED;
            handleResult.msg = 'User is already in room';
            return;
        }

        if(this.isFull) {
            handleResult.code = ResultCode.REQUEST_FAILED;
            handleResult.msg = 'Room is full';
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
        if (!!user.hasCleanUp) return;

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

    handleUserPaused(user, handleResult) {

    }

    handleUserResumed(user, handleResult) {

    }

    onUserLeft(user) {
        this._adaptor.onUserLeft(user);
        this.removeUser(user, true);
    }

    addUser(user, notify) {
        if(this._addUser(user)) {
            user._room = this;
            if(notify) {
                this.broadcast(this._buildJoinLeaveNotify(user, true));
            }
            return true;
        }
        return false;
    }

    removeUser(user, notify) {
        if(this._removeUser(user)) {
            user._room = null;
            if(notify) {
                this.broadcast(this._buildJoinLeaveNotify(user, false));
            }
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
        return MessageBuilder.buildNotify(isJoin ? NotifyType.USER_JOINED_ROOM : NotifyType.USER_LEFT_ROOM, payload);
    }
}

module.exports = Room;