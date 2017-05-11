/**
 * Created by baonguyen on 4/13/2017.
 */
let config = require('./config');
let nano = require('../../index');
let Room = require('./game-room');
let logger = nano.Logger.createLogger('SYSTEM');

nano.Logger.setLevel('debug');

let RoomFactory = {
    createRoom(type) {
        return new Room(type);
    }
};

class GameServer extends nano.Server {
    constructor(config) {
        super(config);

        this.roomFactory = RoomFactory;

        this.createRoom(1, 100);
    }
}

exports.start = () => {
    // config.init();

    let _cfg = {
        port: 9000
    };
    let gameServer = new GameServer(_cfg);

    let b = '======\t';
    logger.info(b, b, b, b, b, b, b);
    logger.info(b, b, 'START   ROOM   SERVICE\t', b, b);
    logger.info(b, b, b, b, b, b, b);

    gameServer.start();
};