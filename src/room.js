'use strict';

let EventEmitter = require('events');
let util = require('./util');
let MessageBuilder = require('./message-builder');
let NotifyType = require('./constants').NotifyType;

class Room extends EventEmitter {
    constructor(type) {
        super();
        this._id = util.generateNumber();
        this._owner = '';
        this._name = '';
        this._type = type;
        this._users = new Map();
        this._maxUser = 999999999;
    }

    get id() { return this._id};
    get type() { return this._type};
    get server() { return this._server};

    get maxUser(){ return this._maxUser};
    set maxUser(maxUser){ this._maxUser = maxUser};

    get owner(){ return this._owner};
    set owner(owner){ this._owner = owner};

    get name(){ return this._name};
    set name(name){ this._name = name};

    broadcast(msg, excludes) {
        if(!!excludes) {
            let _users = Array.from(this._users.values()).filter(function(user){return excludes.indexOf(user) == -1;});
            _users.forEach(function(user) {
                user.sendMessage(msg);
            });
        } else {
            for (let user of this._users.values()) {
                user.sendMessage(msg);
            }
        }
    }

    findUserByName (name) {
        for (let user of this._users.values()) {
            if(user.name == name) return user;
        }
    }

    removeUser(user, notify) {
        this._users.delete(user.id);
        if (notify) {
            this.broadcast(this._buildJoinLeaveNotify(user, false));
        }
    }

    handleUserJoin(user, handleResult) {
        if(!user) return;

        this._users.set(user.id, user);
        user.room = this;
        this.broadcast(this._buildJoinLeaveNotify(user, true));
    }

    handleUserLeave(user, handleResult) {
        if(!user) return;
        if(!!user.hasCleanup) return;

        this.removeUser(user);
    }

    handleUserPause(user, handleResult) {

    }

    handleUserResume(user, handleResult) {

    }

    checkUserJoined(userId) {
        return this._users.has(userId);
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