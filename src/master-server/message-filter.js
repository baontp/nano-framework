/**
 * Created by baonguyen on 5/5/2017.
 */
'use strict';

let MessageType = require('../constants').MessageType;
let PayloadType = require('../constants').PayloadType;
let ResponseMessage = require('./response');
let NotifyMessage = require('./notify');
let UpdateMessage = require('./update-peer');
let util = require('../util');

class MessageFilter {
    decode(data) {
        if(data[0] == MessageType.RESPONSE) {
            return new ResponseMessage(data, 0);
        } else if(data[0] == MessageType.NOTIFY) {
            return new NotifyMessage(data, 0);
        } else if(data[0] == MessageType.UPDATE) {
            return new UpdateMessage(data, 0);
        }
    }

    encode(message) {
        let index = 0;
        let payload = message.payload;
        let payloadSize = message.payloadType == PayloadType.JSON ? payload.length : message.payloadSize;
        let byteArray = new Uint8Array(message.getHeaderSize() + 4 + payloadSize);
        index = message.header2Bytes(byteArray, index);
        index = util.intToBytes(payloadSize, byteArray, index);

        switch (message.payloadType) {
            case PayloadType.NUMBER:
                if(payloadSize == 1) {
                    byteArray[index++] = payload;
                } else {
                    for (let i = 0; i < payloadSize; ++i) {
                        byteArray[index++] = payload[i];
                    }
                }
                break;
            case PayloadType.BINARY:
                for (let i = 0; i < payloadSize; ++i) {
                    byteArray[index++] = payload[i];
                }
                break;
            default:
                for (let i = 0; i < payloadSize; ++i) {
                    byteArray[index++] = payload.charCodeAt(i);
                }
        }
        return byteArray.buffer;
    }
}
module.exports = MessageFilter;