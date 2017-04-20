'use strict';

let HashMap = require('hashmap');
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
        this._requestHandlerMap = new HashMap();
        this._updateHandlerMap = new HashMap();

        this._requestHandlerMap.set(RequestType.AUTHENTICATE_USER, this._handleAuthRequest);
        this._requestHandlerMap.set(RequestType.USER_ACTION, this._handleUserAction);
        this._requestHandlerMap.set(RequestType.CREATE_ROOM, this._handleCreateRoom);
        this._requestHandlerMap.set(RequestType.JOIN_ROOM, this._handleJoinRoom);
        this._requestHandlerMap.set(RequestType.LEAVE_ROOM, this._handleLeaveRoom);
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
                let message = MessageBuilder.buildResponseMessage(requestType, ResultCode.BAD_REQUEST, PayloadType.JSON, 'User is unauthenticated');
                socket.sendMessage(message);
                return;
            }
            requestHandler.call(this, socket, message);
        }
    }

    /**
     *
     * @param {WebSocket} socket
     * @param {UpdateMessage} message
     */
    onUpdateReceived(socket, message) {
        let updateType = message.updateType;
        let updateHandler = this._updateHandlerMap.get(updateType);
        if (updateHandler != null) {
            let user = socket.user;
            if (user === undefined) {
                let message = MessageBuilder.buildResponseMessage(updateType, ResultCode.BAD_REQUEST, PayloadType.JSON, 'User is unauthenticated');
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
            .then(function (handleResult) {
                if (handleResult.code == ResultCode.SUCCESS) {
                    let message = MessageBuilder.buildAuthResponse(ResultCode.SUCCESS, socket.sessionId, 'User Authentication success!');
                    user.send(message);

                    this.primaryLobby.handleUserJoin(user, handleResult);

                    socket.user = user;
                    socket.recoverytime = payload.recoverytime;
                    return;
                }

                if (!handleResult.skipResponse) {
                    let message = MessageBuilder.buildAuthResponse(ResultCode.AUTH_ERROR, 0, handleResult.message);
                    user.send(message);
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
        let action = payload.action;
        let params = payload.params;
        let user = socket.user;
        let room = user.room;
        if (room) {
            if (room[action] !== undefined && typeof room[action] === 'function') {
                params.unshift(user);
                room[action].apply(room, params);
            } else {
                user.send(MessageBuilder.buildResponseMessage(request.requestType(), ResultCode.BAD_REQUEST, PayloadType.JSON,
                    `${action} action is not defined or not a function in room ${room.id}`));
            }
        } else {
            user.send(MessageBuilder.buildResponseMessage(request.requestType(), ResultCode.BAD_REQUEST, PayloadType.JSON,
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

    }

    /**
     *
     * @param {WebSocket} socket
     * @param {RequestMessage} request
     * @private
     */
    _handleLeaveRoom(socket, request) {

    }
}

module.exports = Handler;