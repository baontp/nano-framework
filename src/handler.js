'use strict';

let constants = require('./constants');
let util = require('./util');
let User = require('./user');
let HandleResult = require('./handle-result');
let MessageBuilder = require('./message-builder');
let logger = require('nano-log').createLogger('HANDLER');

let RequestType = constants.RequestType;
let PayloadType = constants.PayloadType;
let ResultCode = constants.ResultCode;
let MessageType = constants.MessageType;
let ServiceType = constants.ServiceType;
let RoomType = constants.RoomType;

class Handler {
    constructor(server) {
        this._server = server;
        this._requestHandlerMap = new Map();
        this._updateHandlerMap = new Map();

        this._requestHandlerMap.set(RequestType.AUTHENTICATE_USER, this._handleAuthRequest);
        this._requestHandlerMap.set(RequestType.USER_ACTION, this._handleUserAction);
        this._requestHandlerMap.set(RequestType.CREATE_ROOM, this._handleCreateRoom);
        this._requestHandlerMap.set(RequestType.JOIN_ROOM, this._handleJoinRoom);
        this._requestHandlerMap.set(RequestType.LEAVE_ROOM, this._handleLeaveRoom);
        this._requestHandlerMap.set(RequestType.FIND_ROOM, this._handleFindRoom);
    }

    onSocketConnected(socket) {
    }

    onSocketClosed(socket) {
        let user = socket.user;
        let lobby = user ? user.lobby : null;
        if (lobby) {
            if (socket.recoverytime > 0) {
                lobby.handleUserPaused(user);
            } else {
                lobby.handleUserLeave(user, new HandleResult());
            }
        }
    }

    /**
     *
     * @param {WebSocket} socket
     * @param {RequestMessage} message
     */
    onRequestReceived(socket, message) {
        let requestType = message.requestType;
        let requestHandler = this._requestHandlerMap.get(requestType);
        if (requestHandler != null) {
            let user = socket.user;
            if (requestType == RequestType.AUTHENTICATE_USER && !user) {
                requestHandler.call(this, socket, message);
            } else if (!!user) {
                requestHandler.call(this, user, message);
            } else {
                let message = MessageBuilder.buildResponse(requestType, ResultCode.BAD_REQUEST, 'User is unauthenticated');
                socket.sendMessage(message);
            }
        }
    }

    /**
     *
     * @param {WebSocket} socket
     * @param {NotifyMessage} message
     */
    onUpdateReceived(socket, message) {
        let updateType = message.notifyType;
        let updateHandler = this._updateHandlerMap.get(updateType);
        if (updateHandler != null) {
            let user = socket.user;
            if (user === undefined) {
                let message = MessageBuilder.buildResponse(updateType, ResultCode.BAD_REQUEST, 'User is unauthenticated');
                socket.sendMessage(message);
                return;
            }
            updateHandler.call(this, user, message);
        }
    }

    /**
     *
     * @param {WebSocket} socket
     * @param {RequestMessage} request
     * @private
     */
    _handleAuthRequest(socket, request) {
        let payload = request.payload;
        let userName = payload.user;
        let authData = payload.authData;
        if (userName === undefined || authData === undefined) {
            let message = MessageBuilder.buildAuthResponse(ResultCode.BAD_REQUEST, 0, 'Missing data');
            socket.sendMessage(message);
            return;
        }

        let handleResult = new HandleResult();
        let user = this._server.userFactory.createUser(userName, socket, null);
        this._server.services.getService(ServiceType.USER_AUTH).authenticateUser(user, authData, handleResult)
            .then((handleResult) => {
                if (handleResult.code == ResultCode.SUCCESS) {
                    let message = MessageBuilder.buildAuthResponse(ResultCode.SUCCESS, socket.sessionId, 'User Authentication success!');
                    user.sendMessage(message);

                    this._server.primaryLobby.handleUserJoin(user, handleResult);

                    socket.user = user;
                    socket.recoverytime = payload.recoverytime;
                    return;
                }

                if (!handleResult.skipResponse) {
                    let message = MessageBuilder.buildAuthResponse(ResultCode.AUTH_ERROR, 0, handleResult.message);
                    user.sendMessage(message);
                    user.disconnect();
                }
            });
    }

    /**
     *
     * @param {User} user
     * @param {RequestMessage} request
     * @private
     */
    _handleUserAction(user, request) {
        let payload = request.payload;
        let action = payload.a;
        let params = !!payload.p ? payload.p : [];
        let location = user.room;
        let locationStr = 'room';
        if (!location) {
            if (!user.lobby) {
                user.sendMessage(MessageBuilder.buildResponse(request.requestType, ResultCode.BAD_REQUEST, `User is not in any room/lobby`));
                return;
            }
            location = user.lobby;
            locationStr = 'lobby';
        }

        let adaptor = location.adaptor;
        if (!adaptor) {
            logger.warn(`Adaptor in ${locationStr} ${location.id} is null`);
            user.sendMessage(MessageBuilder.buildResponse(request.requestType, ResultCode.REQUEST_FAILED,
                `${action} action can not handled in ${locationStr} ${location.id}`));
            return;
        }
        if (!adaptor[action] || typeof adaptor[action] !== 'function') {
            user.sendMessage(MessageBuilder.buildResponse(request.requestType, ResultCode.BAD_REQUEST,
                `${action} action is not defined or not a function in ${locationStr} adaptor of ${locationStr} ${location.id}`));
            return;
        }
        params.unshift(user);
        adaptor[action].apply(adaptor, params);
    }

    /**
     *
     * @param {User} user
     * @param {RequestMessage} request
     * @private
     */
    _handleCreateRoom(user, request) {

    }

    /**
     *
     * @param {User} user
     * @param {RequestMessage} request
     * @private
     */
    _handleJoinRoom(user, request) {
        if (!!request.id) {
            MessageBuilder.buildRoomResponse(RequestType.JOIN_ROOM, ResultCode.BAD_REQUEST, null, 'Missing room id');
            return;
        }
        let payload = request.payload;
        let desc = '';
        let handleResult = new HandleResult();
        let lobby = user.lobby;
        if (lobby) {
            let room = user.room;
            if (!room) {
                let roomId = payload.id;
                room = lobby.findRoom(roomId);
                if (room) {
                    room.handleUserJoin(user, handleResult);
                    if (!handleResult.skipResponse && handleResult.code == ResultCode.SUCCESS) {
                        user.sendMessage(MessageBuilder.buildRoomResponse(RequestType.JOIN_ROOM, ResultCode.SUCCESS, room));
                        return;
                    } else {
                        desc = `Can not join room id ${roomId}`;
                    }
                } else {
                    let msg = MessageBuilder.buildResponse(RequestType.JOIN_ROOM, ResultCode.RESOURCE_NOT_FOUND, '');
                    user.sendMessage(msg);
                    return;
                }
            } else {
                desc = 'Already in room';
                room.handleUserLeave(user, new HandleResult());
            }
        } else {
            desc = 'Join lobby first';
        }

        if (!handleResult.skipResponse) {
            user.sendMessage(MessageBuilder.buildRoomResponse(RequestType.JOIN_ROOM, ResultCode.REQUEST_FAILED, room, desc));
        }
    }

    /**
     *
     * @param {User} user
     * @param {RequestMessage} request
     * @private
     */
    _handleLeaveRoom(user, request) {

    }

    /**
     *
     * @param {User} user
     * @param {RequestMessage} request
     * @private
     */
    _handleFindRoom(user, request) {
        let lobby = user.lobby;
        if (!lobby) {
            let message = MessageBuilder.buildRoomResponse(RequestType.FIND_ROOM, ResultCode.REQUEST_FAILED, 'Join lobby first');
            user.sendMessage(message);
            return;
        }

        let room = lobby.findRoom();
        if (!!room) {
            let message = MessageBuilder.buildRoomResponse(RequestType.FIND_ROOM, ResultCode.SUCCESS, room);
            user.sendMessage(message);
        } else {
            let message = MessageBuilder.buildRoomResponse(RequestType.FIND_ROOM, ResultCode.REQUEST_FAILED, null);
            user.sendMessage(message);
        }
    }
}

module.exports = Handler;