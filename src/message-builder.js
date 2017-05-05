'use strict';

let RequestMessage = require('./message').RequestMessage;
let ResponseMessage = require('./message').ResponseMessage;
let NotifyMessage = require('./message').NotifyMessage;
let UpdateMessage = require('./message').UpdateMessage;
let PayloadType = require('./constants').PayloadType;
let RequestType = require('./constants').RequestType;
let NotifyType = require('./constants').NotifyType;


let MessageBuilder = {};

MessageBuilder.buildActionRequest = function (action, args) {
    if(!!args){
        return {a: action, p: args};
    } else {
        return {a: action};
    }
};

MessageBuilder.buildRequest = (requestType, payLoad) => {
    return new RequestMessage(requestType, PayloadType.JSON, payLoad);
};

MessageBuilder.buildResponse = (requestType, resultCode, payLoad) => {
    return new ResponseMessage(requestType, resultCode, payLoad);
};

MessageBuilder.buildNotify = (notifyType, payLoad) => {
    return new NotifyMessage(notifyType, payLoad);
};

MessageBuilder.buildUpdate = (updateType, payLoadType, payLoad) => {
    return new UpdateMessage(updateType, payLoadType, payLoad);
};

MessageBuilder.buildAuthResponse = (resultCode, sessionId, message) => {
    let payload = {
        sessionId: sessionId,
        message: message
    };
    return MessageBuilder.buildResponse(RequestType.AUTHENTICATE_USER, resultCode, payload);
};

MessageBuilder.buildRoomResponse = (requestType, resultCode, room, desc) => {
    let payload = !!room ? {
        i: room.id,
        o: room.owner,
        n: room.name,
        m: room.maxUser,
    } : {};
    payload.d = desc ? desc : '';
    return MessageBuilder.buildResponse(requestType, resultCode, payload);
};

MessageBuilder.buildUserActionNotify = function (action) {
    let args = [];
    for (let i = 1; i < arguments.length; ++i) {
        args[i - 1] = arguments[i];
    }
    let payload = {
        a: action,
        p: args
    };
    return MessageBuilder.buildNotify(NotifyType.USER_ACTION, payload);
};

MessageBuilder.buildUserActionResponse = function (resultCode, action, desc) {
    let payload = {
        a: action,
        d: desc
    };
    return MessageBuilder.buildResponse(RequestType.USER_ACTION, resultCode, payload);
};

module.exports = MessageBuilder;