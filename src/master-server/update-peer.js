/**
 * Created by baonguyen on 4/24/2017.
 */
let util = require('../util');
let constants = require('../constants');
let BaseUpdateMessage = require('../message').UpdateMessage;
let MessageType = constants.MessageType;
let PayloadType = constants.PayloadType;
let RequestType = constants.RequestType;

class UpdateMessage extends BaseUpdateMessage {
    constructor(responseBytes, startIndex) {
        let messageType = responseBytes[startIndex++];
        let updateType = responseBytes[startIndex++];
        let payLoadType = responseBytes[startIndex++];
        let payLoadSize = util.bytesToInt(responseBytes, startIndex); startIndex += 4;
        let payLoad = new Uint8Array(payLoadSize);
        for (let i = 0; i < payLoadSize; i++) {
            payLoad[i] = responseBytes[startIndex + i];
        }
        super(updateType, payLoad);

        if (this._payloadType == PayloadType.NUMBER) {
            if (payLoadSize > 1) {
                this._payload = util.bytesToInt(this._payload, 0);
            }
        }
    }

    get payload() {
        if(this._payloadType == PayloadType.JSON) {
            return JSON.parse(util.bin2String(this._payload));
        } else {
            return this._payload;
        }
    }
}

module.exports = UpdateMessage;