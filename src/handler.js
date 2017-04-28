'use strict';

let constants = require('./constants');
let util = require('./util');
let User = require('./user');
let HandleResult = require('./handle-result');
let MessageBuilder = require('./message-builder');

let RequestType = constants.RequestType;
let PayloadType = constants.PayloadType;
let ResultCode = constants.ResultCode;
let MessageType = constants.MessageType;
let ServiceType = constants.ServiceType;

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
        let room = user ? user.room : null;
        if (room) {
            if (socket.recoverytime > 0) {
                room.handleUserPause(user);
            } else {
                room.handleUserLeave(user);
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
            if (requestType != RequestType.AUTHENTICATE_USER && user === undefined) {
                let message = MessageBuilder.buildResponse(requestType, ResultCode.BAD_REQUEST, PayloadType.JSON, 'User is unauthenticated');
                socket.sendMessage(message);
                return;
            }
            requestHandler.call(this, socket, message);
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
                let message = MessageBuilder.buildResponse(updateType, ResultCode.BAD_REQUEST, PayloadType.JSON, 'User is unauthenticated');
                socket.sendMessage(message);
                return;
            }
            updateHandler.call(this, socket, message);
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
     * @param {WebSocket} socket
     * @param {RequestMessage} request
     * @private
     */
    _handleUserAction(socket, request) {
        let payload = request.payload;
        let action = payload.a;
        let params = !!payload.p ? payload.p : [];
        let user = socket.user;
        let room = user.room;
        if (room) {
            if (room[action] !== undefined && typeof room[action] === 'function') {
                params.unshift(user);
                room[action].apply(room, params);
            } else {
                user.sendMessage(MessageBuilder.buildResponse(request.requestType, ResultCode.BAD_REQUEST, PayloadType.JSON,
                    `${action} action is not defined or not a function in room ${room.id}`));
            }
        } else {
            user.sendMessage(MessageBuilder.buildResponse(request.requestType(), ResultCode.BAD_REQUEST, PayloadType.JSON,
                `User is not in any room`));
        }
    }

    /**
     *
     * @param {WebSocket} socket
     * @param {RequestMessage} request
     * @private
     */
    _handleCreateRoom(socket, request) {

    }

    /**
     *
     * @param {WebSocket} socket
     * @param {RequestMessage} request
     * @private
     */
    _handleJoinRoom(socket, request) {
        if (!!request.id) {
            MessageBuilder.buildRoomResponse(RequestType.JOIN_ROOM, ResultCode.BAD_REQUEST, null, 'Missing room id');
            return;
        }
        let payload = request.payload;
        let user = socket.user;
        let room = user.room;
        let desc = '';
        if (room === this._server.primaryLobby) {
            let handleResult = new HandleResult();
            this._server.primaryLobby.handleUserLeave(user, handleResult);

            if (handleResult.code == ResultCode.SUCCESS) {
                let roomId = payload.id;
                room = this._server._roomMap.get(roomId);
                if (!!room) {
                    room.handleUserJoin(user, handleResult);
                    if (!handleResult.skipResponse && handleResult.code == ResultCode.SUCCESS) {
                        user.sendMessage(MessageBuilder.buildRoomResponse(RequestType.JOIN_ROOM, ResultCode.SUCCESS, room));
                        return;
                    } else {
                        desc = `Can not join room id ${roomId}`;
                    }
                } else {
                    let msg = MessageBuilder.buildResponse(RequestType.JOIN_ROOM, ResultCode.RESOURCE_NOT_FOUND, PayloadType.JSON, '');
                    user.sendMessage(msg);
                    return;
                }
            } else {
                desc = 'Can not leave lobby';
            }
        } else {
            desc = 'Already in room';
            room.handleUserLeave(user, new HandleResult());
        }

        user.sendMessage(MessageBuilder.buildRoomResponse(RequestType.JOIN_ROOM, ResultCode.REQUEST_FAILED, room, desc));
    }

    /**
     *
     * @param {WebSocket} socket
     * @param {RequestMessage} request
     * @private
     */
    _handleLeaveRoom(socket, request) {

    }

    /**
     *
     * @param {WebSocket} socket
     * @param {RequestMessage} request
     * @private
     */
    _handleFindRoom(socket, request) {
        let room = this._server.findRoom();
        if (!!room) {
            let message = MessageBuilder.buildRoomResponse(RequestType.FIND_ROOM, ResultCode.SUCCESS, room);
            socket.sendMessage(message);
        } else {
            let message = MessageBuilder.buildRoomResponse(RequestType.FIND_ROOM, ResultCode.REQUEST_FAILED, null);
            socket.sendMessage(message);
        }
    }
}

module.exports = Handler;