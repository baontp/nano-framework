'use strict';
let EE = require('events');
let WebSocket = require('ws');
let MessageFilter = require('./message-filter');
let MessageBuilder = require('./message-builder');
let RequestType = require('./../constants').RequestType;
let MessageType = require('./../constants').MessageType;
let PayloadType = require('./../constants').PayloadType;
let ResultCode = require('./../constants').ResultCode;
let logger = require('nano-log').createLogger('MASTER-SERVER');

let TRY_TIMES = 5;
let DELAY_RETRY_TIME = 5000;
let SLEEP_FAILED_TIME = 60000 * 5;
class MasterServer extends EE {
    constructor() {
        super();
        this._messageFilter = new MessageFilter();
        this._tryToReconnect = true;
        this._tryTimes = 0;
        this._eventHandlers = {};
        this._eventHandlers['user-action'] = {};
        this._updatePeerHandlers = {};
    }

    set tryToReconnect(value) {
        this._tryToReconnect = value
    }

    init(key) {
        this._key = key;
    }

    connect(hostname, port) {
        this._hostname = hostname;
        this._port = port;

        this._socket = new WebSocket(['ws://', hostname, ':', port].join(''));
        this._socket.on('open', () => {
            this.sendMessage(MessageBuilder.buildServerAuthRequest(this._key));
        });
        this._socket.on('close', () => {
            logger.info('Lose connection with master server!');
            if (this._tryToReconnect) {
                if (this._tryTimes++ <= TRY_TIMES) {
                    logger.info('Try to reconnect in', (DELAY_RETRY_TIME / 1000) + 's -', this._tryTimes, 'times ...');
                    setTimeout(this.connect.bind(this), DELAY_RETRY_TIME, this._hostname, this._port);
                } else {
                    logger.info('Maximum try times', 5);
                    logger.info('Sleep in', (SLEEP_FAILED_TIME / 1000) + 's', 'then try to reconnect again ...');
                }
            } else {
                logger.info('No config trying reconnect');
                this.emit('close');
            }
        });
        this._socket.on('message', (data) => {
            let message;
            try {
                message = this._messageFilter.decode(data);
            } catch (err) {
                err && logger.error(`while decode data ${err}`);
                return;
            }
            this.onMessage(message);
        });
        this._socket.on('error', (err) => {
            // this.emit('error', err);
            logger.info('Can not connect to master server');
        });
    }

    onUpdatePeer(updateType, handler) {
        this._updatePeerHandlers[updateType] = handler;
    }

    onMessage(message) {
        if (message.type == MessageType.RESPONSE) {
            this.handleResponse(message);
        } else if (message.type == MessageType.NOTIFY) {
            this.handleNotify(message);
        } else if (message.type == MessageType.UPDATE) {
            this.emitUpdatePeer(message.updateType, message.payload);
        }
    }

    handleResponse(message) {
        let requestType = message.requestType;
        let resultCode = message.resultCode;
        let payload = message.payload;
        switch (requestType) {
            case RequestType.AUTHENTICATE_USER: {
                if(resultCode == ResultCode.SUCCESS) {
                    this.emit('open');
                } else {
                    this._socket.close();
                }
                break;
            }
            case RequestType.USER_ACTION: {
                let responseHandler = !!payload.a ? this._eventHandlers['user-action'][payload.a] : null;
                if (!!responseHandler) {
                    responseHandler.call(this, resultCode, payload.d);
                    delete this._eventHandlers['user-action'][payload.a];
                }
                break;
            }
        }
    }

    handleNotify(message) {
        let notifyType = message.notifyType;
        let payload = message.payload;
    }

    emitUpdatePeer(updateType, payload) {
        if (this._updatePeerHandlers[updateType]) {
            this._updatePeerHandlers[updateType].call(this, payload);
        } else {
            logger('update type', updateType, ' is not handled');
        }
    }

    sendAction(action) {
        if (!action) throw new Error('missing action');

        let args = [];
        let offset = 0;
        let responseHandler = null;
        if (arguments.length > 1 && typeof arguments[arguments.length - 1] === 'function') {
            responseHandler = arguments[arguments.length - 1];
            offset = 1;
        }
        for (let i = 1, l = arguments.length - offset; i < l; ++i) {
            args[i - 1] = arguments[i];
        }
        let payload = MessageBuilder.buildActionRequest(action, args.length > 0 ? args : null);
        let message = MessageBuilder.buildRequest(RequestType.USER_ACTION, payload);
        this.sendMessage(message);

        if (!!responseHandler) {
            this._eventHandlers['user-action'][action] = responseHandler;
        }
    }

    sendMessage(message) {
        this._socket.send(this._messageFilter.encode(message));
    }
}

let instance;
exports.get = () => {
    if (!instance) {
        instance = new MasterServer();
    }
    return instance;
};