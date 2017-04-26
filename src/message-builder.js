'use strict';

let ResponseMessage = require('./message').ResponseMessage;
let UpdateMessage = require('./message').UpdateMessage;
let PayloadType = require('./constants').PayloadType;
let RequestType = require('./constants').RequestType;
let NotifyType = require('./constants').NotifyType;


let MessageBuilder = {};

MessageBuilder.buildResponseMessage = (requestType, resultCode, payLoadType, payLoad) => {
    return new ResponseMessage(requestType, resultCode, payLoadType, payLoad);
};

MessageBuilder.buildNotifyMessage = (notifyType, payLoadType, payLoad) => {
    return new ResponseMessage(notifyType, payLoadType, payLoad);
};

MessageBuilder.buildAuthResponse = (resultCode, sessionId, message) => {
    let payload = {
        sessionId: sessionId,
        message: message
    };
    return MessageBuilder.buildResponseMessage(RequestType.AUTHENTICATE_USER, resultCode, PayloadType.JSON, payload);
};

MessageBuilder.buildRoomResponse = (requestType, resultCode, room, desc) => {
    let payload = !!room ? {
        i: room.id,
        o: room.owner,
        n: room.name,
        m: room.maxUser,
        d: !!desc ? desc : ''
    } : '';
    return MessageBuilder.buildResponseMessage(requestType, resultCode, PayloadType.JSON, payload);
};

MessageBuilder.buildUserActionNotify = function (action) {
    let args = arguments.shift();
    let payload = {
        action: action,
        params: args
    };
    return MessageBuilder.buildNotifyMessage(NotifyType.USER_ACTION, PayloadType.JSON, payload);
};

module.exports = MessageBuilder;