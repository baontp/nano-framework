'use strict';

let ResponseMessage = require('./message').ResponseMessage;
let UpdateMessage = require('./message').UpdateMessage;
let PayloadType = require('./constants').PayloadType;
let RequestType = require('./constants').RequestType;


let MessageBuilder = {};

MessageBuilder.buildResponseMessage = (requestType, resultCode, payLoadType, payLoad) => {
    return new ResponseMessage(requestType, resultCode, payLoadType, payLoad);
};

MessageBuilder.buildAuthResponse = (resultCode, sessionId, message) => {
    let payload = {};
    payload.sessionId = sessionId;
    payload.message = message;
    return MessageBuilder.buildResponseMessage(RequestType.AUTHENTICATE_USER, resultCode, PayloadType.JSON, payload);
};

module.exports = MessageBuilder;