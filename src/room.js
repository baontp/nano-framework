'use strict';

let EventEmitter = require('events');
let util = require('./util');

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
        this._users.get(name);
    }

    removeUser(user) {
        this._users.delete(user.name);
    }

    handleUserJoin(user, handleResult) {
        if(!user) return;

        this._users.set(user.name, user);
        user.room = this;
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

    checkUserJoined(userName) {
        return this._users.has(userName);
    }
}

module.exports = Room;