'use strict';

let MessageType = require('./constants').MessageType;
let PayloadType = require('./constants').PayloadType;
let util = require('./util');
let logger = require('nano-log').createLogger('MESSAGE');

/**
 * Base Message
 */
class Message {
    constructor(type, payloadType, payload) {
        this._type = type;
        this._payloadType = payloadType;
        this._payload = payload;
    }

    get type() {
        return this._type;
    };

    get payloadType() {
        return this._payloadType;
    };

    get payloadRaw() {
        return this._payload;
    };

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
    constructor(requestType, payloadType, payload) {
        super(MessageType.REQUEST, payloadType, payload);
        this._requestType = requestType;
    }

    get requestType() {
        return this._requestType;
    }

    get payload() {
        return JSON.parse(util.bin2String(this._payload));
    };

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
    constructor(requestType, resultCode, payload) {
        super(MessageType.RESPONSE, PayloadType.JSON, payload);
        this._requestType = requestType;
        this._resultCode = resultCode;
    }

    get requestType() {
        return this._requestType;
    }

    get resultCode() {
        return this._resultCode;
    }

    get payload() {
        return JSON.stringify(this._payload);
    };

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
 * NotifyMessage
 */
class NotifyMessage extends Message {
    constructor(notifyType, payload) {
        super(MessageType.NOTIFY, PayloadType.JSON, payload);
        this._notifyType = notifyType;
    }

    get payload() {
        return JSON.stringify(this._payload)
    };

    get notifyType() {
        return this._notifyType;
    }

    header2Bytes(data, startIndex) {
        data[startIndex++] = this._type;
        data[startIndex++] = this._notifyType;
        data[startIndex++] = this._payloadType;
        return startIndex;
    }

    getHeaderSize() {
        return 3;
    }
}
module.exports.NotifyMessage = NotifyMessage;

/**
 * UpdateMessage
 */
class UpdateMessage extends Message {
    constructor(updateType, payloadType, payload) {
        super(MessageType.UPDATE, payloadType, payload);
        this._updateType = updateType;

        if (payloadType == PayloadType.NUMBER) {
            if(typeof payload === 'number') {
                this._numberSize = 1;
                if (payload > 255) {
                    this._numberSize = 4;
                    this._payload = new Uint8Array(4);
                    util.intToBytes(payload, this._payload, 0);
                }
            } else {
                logger.warn('Update Message:', 'Payload Type input is NUMBER, but actual typeof payload is not. Convert Payload Type to BINARY');
                this._payloadType = PayloadType.BINARY;
            }
        }
    }

    get payload() {
        switch (this._payloadType) {
            case PayloadType.NUMBER:
            case PayloadType.BINARY:
                return this._payload;
            default:
                return JSON.stringify(this._payload);
        }
    }

    get payloadSize() {
        switch (this._payloadType) {
            case PayloadType.NUMBER:
                return this._numberSize;
            case PayloadType.BINARY:
                return this._payload.length;
            default:
                return JSON.stringify(this._payload).length;
        }
    }

    get updateType() {
        return this._updateType;
    }

    header2Bytes(data, startIndex) {
        data[startIndex++] = this._type;
        data[startIndex++] = this._updateType;
        data[startIndex++] = this._payloadType;
        return startIndex;
    }

    getHeaderSize() {
        return 3;
    }
}
module.exports.UpdateMessage = UpdateMessage;