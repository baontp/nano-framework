'use strict';

let EventEmitter = require('events');
let HashMap = require('hashmap');
let util = require('./util');

class Room extends EventEmitter {
    constructor(type) {
        super();
        this._id = util.generateNumber();
        this._owner = '';
        this._name = '';
        this._type = type;
        this._users = new HashMap();
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

    _removeUser(user) {
        user.cleanUp();
        this._users.remove(user.name);
    }

    handleUserJoin(user, handleResult) {
        if(!user) return;

        this._users.set(user.name, user);
        user.room = this;
    }

    handleUserLeave(user, handleResult) {
        if(!user) return;
        if(!!user.hasCleanup) return;

        this._removeUser(user);
    }

    handleUserPause(user, handleResult) {

    }

    handleUserResume(user, handleResult) {

    }

    checkUserJoined(userName) {
        return this._users.has(userName);
    }
}

module.exports = Room;