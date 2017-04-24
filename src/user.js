'use strict';

let logger = require('nano-log').createLogger('USER');
let util = require('./util');

class User {
    constructor(name, socket, room) {
        this._id = util.generateNumber();
        this._room = room;
        this._name = name;
        this._alias = '';
        this._socket = socket;
        this._sessionId = socket.sessionId;

        logger.prefix = name;
    }

    get room(){ return this._room };
    set room(room){ this._room = room };

    get name(){ return this._name };
    set name(name){ return this._name = name };

    get alias(){ return this._alias};
    set alias(alias){ return this._alias = alias};

    get hasCleanup(){ return this._socket.deleted; }

    send(message) {
        this._socket.sendMessage(message);
    }

    disconnect() {
        this._socket.close();
    }

    cleanUp() {
        this._socket.deleted = true;
        this._socket.close();
    }
}

module.exports = User;
