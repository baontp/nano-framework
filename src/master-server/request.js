/**
 * Created by baonguyen on 5/5/2017.
 */
let util = require('../util');
let constants = require('../constants');
let Message = require('../message').Message;
let MessageType = constants.MessageType;
let PayloadType = constants.PayloadType;
let RequestType = constants.RequestType;

class RequestMessage extends Message {
    constructor(requestType, payloadType, payload) {
        super(MessageType.REQUEST, payloadType, payload);
        this._requestType = requestType;
    }

    get requestType() {
        return this._requestType;
    }

    get payload() {
        return JSON.stringify(this._payload);
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
module.exports = RequestMessage;