'use strict';

let EventEmitter = require('events');
let util = require('./util');
let MessageBuilder = require('./message-builder');
let Domain = require('./domain');
let NotifyType = require('./constants').NotifyType;

class Room extends Domain {
    constructor(type) {
        super();
        this._id = util.generateNumber();
        this._owner = '';
        this._name = '';
        this._type = type;
    }

    get id() { return this._id};
    set id(id) {this._id = id};

    get type() { return this._type};
    get server() { return this._server};

    get maxUser(){ return this._maxUser};
    set maxUser(maxUser){ this._maxUser = maxUser};

    get owner(){ return this._owner};
    set owner(owner){ this._owner = owner};

    get name(){ return this._name};
    set name(name){ this._name = name};


    handleUserJoin(user, handleResult) {
        if (!user) return;

        this.addUser(user);
        user.room = this;
        this.broadcast(this._buildJoinLeaveNotify(user, true));
    }

    handleUserLeave(user, handleResult) {
        if (!user) return;
        if (!!user.hasCleanup) return;

        if (this.removeUser(user.id)) {
            this.broadcast(this._buildJoinLeaveNotify(user, false));
        }
    }

    handleUserPause(user, handleResult) {

    }

    handleUserResume(user, handleResult) {

    }

    _buildJoinLeaveNotify(user, isJoin) {
        let payload = {
            i: this.id,
            o: this.owner,
            n: this.name,
            m: this.maxUser,
            u: user.name
        };
        // reMessageBuilder.buildResponse(requestType, resultCode, PayloadType.JSON, payload);
        return MessageBuilder.buildNotify(isJoin ? NotifyType.USER_JOINED_ROOM : NotifyType.USER_LEFT_ROOM, payload);
    }
}

module.exports = Room;