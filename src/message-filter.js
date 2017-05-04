'use strict';

let MessageType = require('./constants').MessageType;
let PayloadType = require('./constants').PayloadType;
let RequestMessage = require('./message').RequestMessage;
let UpdateMessage = require('./message').NotifyMessage;
let util = require('./util');

class MessageFilter {
    decode(data) {
        let index = 0;
        let type = data[index++];
        let requestType = data[index++];
        let payloadType = data[index++];
        let payLoadSize = util.bytesToInt(data, index);
        index += 4;
        let payLoad = new Uint8Array(payLoadSize);
        for (let i = 0; i < payLoadSize; i++) {
            payLoad[i] = data[index++];
        }

        return new RequestMessage(requestType, payloadType, payLoad);
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