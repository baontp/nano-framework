/**
 * Created by baonguyen on 5/5/2017.
 */
let util = require('../util');
let constants = require('../constants');
let BaseResponseMessage = require('../message').ResponseMessage;
let MessageType = constants.MessageType;
let PayloadType = constants.PayloadType;
let RequestType = constants.RequestType;


class ResponseMessage extends BaseResponseMessage {
    constructor(responseBytes, startIndex) {
        let messageType = responseBytes[startIndex++];
        let requestType = responseBytes[startIndex++];
        let resultCode = responseBytes[startIndex++];
        let payLoadType = responseBytes[startIndex++];
        let payLoadSize = util.bytesToInt(responseBytes, startIndex); startIndex += 4;
        let payLoad = new Uint8Array(payLoadSize);
        for (let i = 0; i < payLoadSize; i++) {
            payLoad[i] = responseBytes[startIndex + i];
        }
        super(requestType, resultCode, payLoad);
    }

    get payload() {
        return JSON.parse(util.bin2String(this._payload));
    }
}

module.exports = ResponseMessage;