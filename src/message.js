'use strict';

let MessageType = require('./constants').MessageType;
let PayloadType = require('./constants').PayloadType;
let util = require('./util');

/**
 * Base Message
 */
class Message {
    constructor(type, payloadType, payloadSize, payload) {
        this._type = type;
        this._payloadType = payloadType;
        this._payloadSize = payloadSize;
        this._payload = payload;
    }

    get type() { return this._type };
    get payloadType() { return this._payloadType };
    get payloadSize() { return this._payloadSize };
    get payload() { return this._payload };

    header2Bytes(data, startIndex) {
        data[startIndex++] = this._type;
        data[startIndex++] = this._payloadType;
        return startIndex;
    }

    getHeaderSize() {
        return 2;
    }
}

module.exports.Message = Message;

/**
 * RequestMessage
 */
class RequestMessage extends Message {
    constructor(requestType, payloadType, payloadSize, payload) {
        super(MessageType.REQUEST, payloadType, payloadSize, payload);
        this._requestType = requestType;
    }

    get requestType() { return this._requestType; }
    get payload() { return JSON.parse(util.bin2String(this._payload)) };

    header2Bytes(data, startIndex) {
        data[startIndex++] = this._type;
        data[startIndex++] = this._requestType;
        data[startIndex++] = this._payloadType;
        return startIndex;
    }

    getHeaderSize() {
        return 3;
    }
}
module.exports.RequestMessage = RequestMessage;

/**
 * ResponseMessage
 */
class ResponseMessage extends Message {
    constructor(requestType, resultCode, payloadType, payload) {
        super(MessageType.RESPONSE, payloadType, 0, payload);
        this._requestType = requestType;
        this._resultCode = resultCode;
    }

    get requestType() { return this._requestType; }
    get resultCode() { return this._resultCode; }
    get payload() { return JSON.stringify(this._payload) };

    header2Bytes(data, startIndex) {
        data[startIndex++] = this._type;
        data[startIndex++] = this._requestType;
        data[startIndex++] = this._resultCode;
        data[startIndex++] = this._payloadType;
        return startIndex;
    }

    getHeaderSize() {
        return 4;
    }
}
module.exports.ResponseMessage = ResponseMessage;

/**
 * UpdateMessage
 */
class UpdateMessage extends Message {
    constructor(requestType, resultCode, payloadType, payload) {
        super(MessageType.UPDATE, payloadType, payload);
        this._updateType = requestType;
    }

    get updateType() { return this._updateType; }
    header2Bytes(data, startIndex) {
        data[startIndex++] = this._type;
        data[startIndex++] = this._updateType;
        data[startIndex++] = PayloadType.BINARY;
        return startIndex;
    }

    getHeaderSize() {
        return 3;
    }
}
module.exports.UpdateMessage = UpdateMessage;