'use strict';
let nano = require('../../index');
let logger = nano.Logger.createLogger('ROOM');

class Room extends nano.BaseRoom {
    constructor(type){
        super(type);
    }
}

module.exports = Room;