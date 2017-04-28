'use strict';

let ResponseMessage = require('./message').ResponseMessage;
let NotifyMessage = require('./message').NotifyMessage;
let UpdateMessage = require('./message').UpdateMessage;
let PayloadType = require('./constants').PayloadType;
let RequestType = require('./constants').RequestType;
let NotifyType = require('./constants').NotifyType;


let MessageBuilder = {};

MessageBuilder.buildResponse = (requestType, resultCode, payLoadType, payLoad) => {
    return new ResponseMessage(requestType, resultCode, payLoadType, payLoad);
};

MessageBuilder.buildNotify = (notifyType, payLoad) => {
    return new NotifyMessage(notifyType, PayloadType.JSON, payLoad);
};

MessageBuilder.buildUpdate = (updateType, payloadType, payLoad) => {
    return new UpdateMessage(updateType, payloadType, payLoad);
};

MessageBuilder.buildAuthResponse = (resultCode, sessionId, message) => {
    let payload = {
        sessionId: sessionId,
        message: message
    };
    return MessageBuilder.buildResponse(RequestType.AUTHENTICATE_USER, resultCode, PayloadType.JSON, payload);
};

MessageBuilder.buildRoomResponse = (requestType, resultCode, room, desc) => {
    let payload = !!room ? {
        i: room.id,
        o: room.owner,
        n: room.name,
        m: room.maxUser,
    } : {};
    payload.d = desc ? desc : '';
    return MessageBuilder.buildResponse(requestType, resultCode, PayloadType.JSON, payload);
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
    return MessageBuilder.buildResponse(RequestType.USER_ACTION, resultCode, PayloadType.JSON, payload);
};

module.exports = MessageBuilder;