'use strict';

let log = require('nano-log');
let util = require('./util');

class User {
    constructor(name, socket, room) {
        this._id = util.generateNumber();
        this._room = room;
        this._name = name;
        this._socket = socket;
        this._sessionId = socket.sessionId;

        this._logger = log.createLogger('USER');
        this._logger.prefix = name;
    }

    get id(){ return this._id };
    set id(id){ return this._id = id };

    get room(){ return this._room };
    set room(room){ this._room = room };

    get name(){ return this._name };
    set name(name){ this._name = name; this._logger.prefix = name; };

    get hasCleanUp(){ return this._socket.deleted; }

    sendMessage(message) {
        try {
            this._socket.sendMessage(message);
        } catch (err) {
            err && this._logger.error(`while send message, err: ${err}`);
        }
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
