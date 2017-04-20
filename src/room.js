'use strict';

let EventEmitter = require('events');
let HashMap = require('hashmap');
let util = require('./util');

class Room extends EventEmitter {
    constructor(type) {
        super();
        this._id = util.generateNumber();
        this._type = type;
        this._users = new HashMap();
    }

    get id() { return this._id};
    get type() { return this._type};
    get server() { return this._server};

    _removeUser(user) {
        user.cleanUp();
        this._users.remove(user.name);
    }

    handleUserJoin(user, handleResult) {
        if(!user) return;

        this._users.set(user.name, user);
        user.room = this;
    }

    handleUserLeave(user) {
        if(!user) return;
        if(!!user.hasCleanup) return;

        this._removeUser(user);
    }

    handleUserPause(user) {

    }

    handleUserResume(user) {

    }

    checkUserJoined(userName) {
        return this._users.has(userName);
    }
}

module.exports = Room;