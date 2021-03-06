'use strict';
let nano = require('../../index');
let logger = nano.Logger.createLogger('ROOM');

class Room extends nano.BaseRoom {
    constructor(type){
        super(type);
        logger.prefix = `${this.id}`;
    }

    chat(user, msg, receiver) {
        logger.info(user.name, 'send chat :', msg);
    }
}

module.exports = Room;