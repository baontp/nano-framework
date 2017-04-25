/**
 * Created by baonguyen on 4/13/2017.
 */
let config = require('./config');
let nano = require('../');
let CustomUserAuthService = require('./server-impl/services/user-authen');
let Room = require('./server-impl/GameRoom');
let logger = nano.Logger.createLogger('SYSTEM');

nano.Logger.setLevel('debug');
// nano.Logger.initLogFile('../../log/game-log');

let RoomFactory = {
    createRoom(type) {
        return new Room(type);
    }
};

class GameServer extends nano.Server {
    constructor(config) {
        super(config);

        this.roomFactory = RoomFactory;
        this.services.setUserAuthenticateService(CustomUserAuthService);
    }
}

exports.start = () => {
    // config.init();

    let _cfg = {
        port: config.server.port
    };
    let gameServer = new GameServer(_cfg);

    let b = '======\t';
    logger.info(b,b,b,b,b,b,b);
    logger.info(b,b, 'START   ROOM   SERVICE\t', b,b);
    logger.info(b,b,b,b,b,b,b);

    gameServer.start();
};