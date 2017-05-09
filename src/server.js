'use strict';

let WebSocket = require('ws');
let EventEmitter = require('events');
let util = require('./util');
let logger = require('nano-log').createLogger('SYSTEM');
let Handler = require('./handler');
let User = require('./user');
let Room = require('./room');
let Lobby = require('./lobby');
let MessageFilter = require('./message-filter');
let MessageBuilder = require('./message-builder');
let MessageType = require('./constants').MessageType;
let RequestType = require('./constants').RequestType;
let ResultCode = require('./constants').ResultCode;
let Services = require('./services');

class Server extends EventEmitter {
    constructor(config) {
        super();
        this._active = true;
        this._socket = null;
        this._handler = new Handler(this);
        this._messageFilter = new MessageFilter();
        this._roomFactory = RoomFactory;
        this._userFactory = UserFactory;
        this._services = new Services();
        this._parseConfig(config);

        this._lobbyMap = new Map();
        this._roomMap = new Map();

        if (!this._port)
            throw new Error('Port can not null or undefined');
    }

    get services() {
        return this._services
    }

    /**
     *
     * @returns {{createRoom: (function(*=))} | {createLobby: (function()), createRoom: (function(*=))}}
     */
    get roomFactory() {
        return this._roomFactory
    }

    /**
     *
     * @param {{createRoom: (function(*=))} | {createLobby: (function()), createRoom: (function(*=))}} roomFactory
     */
    set roomFactory(roomFactory) {
        if (roomFactory.createLobby === undefined && typeof roomFactory.createLobby !== 'function') {
            logger.warn('Room Factory assigned does not implement createLobby function');
        }
        if (roomFactory.createRoom === undefined && typeof roomFactory.createRoom !== 'function') {
            logger.error('Room Factory must be implemented createRoom function');
            throw new Error('Room Factory must be implemented createRoom function');
        }
        this._roomFactory = roomFactory;
    }

    /**
     *
     * @returns {{createUser: (function(*=, *=, *=))}|*}
     */
    get userFactory() {
        return this._userFactory
    }

    /**
     *
     * @param {{createUser: (function(*=, *=, *=))}|*} userFactory
     */
    set userFactory(userFactory) {
        this._userFactory = userFactory
    }

    get config() {
        return this._config
    }

    _parseConfig(config) {
        this._config = config;
        this._port = config.port;
    }

    start() {
        this._initPrimaryLobby();

        let port = this._port;
        this._socket = new WebSocket.Server({
            port: port,
            perMessageDeflate: false
        }, () => {
            logger.info(`Listen connection on port ${port}`);
        });

        this._socket.on('connection', this._onNewConnection.bind(this));
        this.emit('started');
    }

    _initPrimaryLobby() {
        let lobby;
        if (this._roomFactory.createLobby) {
            lobby = this._roomFactory.createLobby();
        } else {
            lobby = new Lobby();
        }

        this._lobbyMap.set(0, lobby);
    }

    get primaryLobby() {
        return this._lobbyMap.get(0)
    };

    _onNewConnection(socket) {
        // refuse new connection from client when server is inactive
        if (!this._active) {
            logger.info('Server is inactive, refuse new connection');
            socket.close();
            return;
        }

        // wrapper function to process message before let socket send message
        socket.sendMessage = (message) => {
            socket.send(this._messageFilter.encode(message));
        };

        // create an identity per socket
        socket.sessionId = util.generateNumber();

        logger.info(`Open session ${socket.sessionId}`);

        // listen message event
        socket.on('message', (data) => {
            let message;
            try {
                message = this._messageFilter.decode(data);
            } catch (err) {
                err && logger.error(`while decode data ${err}`);
                return;
            }

            // refuse message from client when server is inactive
            if (!this._active) {
                logger.info('Server is inactive, refuse request from client');
                if (message.type == MessageType.REQUEST) {
                    socket.sendMessage(MessageBuilder.buildResponse(message.requestType, ResultCode.SERVICE_UNAVAILABLE));
                }
                return;
            }

            // handle message from client
            try {
                if (message.type == MessageType.REQUEST) {
                    this._handler.onRequestReceived(socket, message);
                } else if (message.type == MessageType.UPDATE) {
                    this._handler.onUpdateReceived(socket, message);
                }
            } catch (err) {
                if (message.type == MessageType.REQUEST) {
                    let requestStr = RequestType[message.requestType] ? RequestType[message.requestType] : message.requestType;
                    err && logger.error(`While process request ${requestStr} error ${err}`);
                } else if (message.type == MessageType.UPDATE) {
                    err && logger.error(`While process update ${message.updateType} error ${err}`);
                }

            }
        });

        // listen socket close event
        socket.on('close', () => {
            try {
                logger.info(`Close session ${socket.sessionId}`);
                this._handler.onSocketClosed(socket);
            } catch (err) {
                err && logger.error(`While handling close socket err: ${err}`);
            }
        });

        this._handler.onSocketConnected(socket);
    }

    createRoom(type, maxUser) {
        let room = this._roomFactory.createRoom(type);
        room.maxUser = !!maxUser ? maxUser : room.maxUser;
        this.emit('room-created', room);
        this._roomMap.set(room.id, room);
        return room;
    }

    findRoom() {
        if (this._roomMap.size <= 0) return null;

        let entry = this._roomMap.entries().next();
        let room = entry.done ? null : entry.value[1];
        return room;
    }
}

let UserFactory = {
    createUser(name, socket, room) {
        return new User(name, socket, room);
    }
};

let RoomFactory = {
    createLobby() {
        return new Lobby();
    },

    createRoom(type) {
        return new Room(type);
    }
};


module.exports = Server;