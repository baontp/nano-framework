'use strict';

let RequestMessage = require('./request');
let PayloadType = require('../constants').PayloadType;
let RequestType = require('../constants').RequestType;
let NotifyType = require('../constants').NotifyType;


let MessageBuilder = {};

MessageBuilder.buildServerAuthRequest = function (key) {
    return MessageBuilder.buildRequest(RequestType.AUTHENTICATE_USER, {
        user: 'server_' + Math.random() * 100000,
        authData: {
            isServer: true,
            key: key
        }
    });
};

MessageBuilder.buildActionRequest = function (action, args) {
    if (!!args) {
        return {a: action, p: args};
    } else {
        return {a: action};
    }
};

MessageBuilder.buildRequest = (requestType, payLoad) => {
    return new RequestMessage(requestType, PayloadType.JSON, payLoad || {});
};

module.exports = MessageBuilder;