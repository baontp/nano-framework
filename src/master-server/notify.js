/**
 * Created by baonguyen on 4/24/2017.
 */
let util = require('../util');
let constants = require('../constants');
let BaseNotifyMessage = require('../message').NotifyMessage;
let MessageType = constants.MessageType;
let PayloadType = constants.PayloadType;
let RequestType = constants.RequestType;


class NotifyMessage extends BaseNotifyMessage {
    constructor(responseBytes, startIndex) {
        let messageType = responseBytes[startIndex++];
        let notifyType = responseBytes[startIndex++];
        let payLoadType = responseBytes[startIndex++];
        let payLoadSize = util.bytesToInt(responseBytes, startIndex); startIndex += 4;
        let payLoad = new Uint8Array(payLoadSize);
        for (let i = 0; i < payLoadSize; i++) {
            payLoad[i] = responseBytes[startIndex + i];
        }
        super(notifyType, payLoad);
    }

    get payload() {
        return JSON.parse(util.bin2String(this._payload));
    }
}

module.exports = NotifyMessage;