'use strict';

let MessageType = require('./constants').MessageType;
let PayloadType = require('./constants').PayloadType;
let RequestMessage = require('./message').RequestMessage;
let UpdateMessage = require('./message').UpdateMessage;
let util = require('./util');

class MessageFilter {
    decode(data) {
        let index = 0;
        let type = data[index++];
        let requestType = data[index++];
        let payloadType = data[index++];
        let payLoadSize = util.bytesToInteger(data, index); index += 4;
        let payLoad = new Uint8Array(payLoadSize);
        for (let i = 0; i < payLoadSize; i++) {
            payLoad[i] = data[index++];
        }

        return new RequestMessage(requestType, payloadType, payLoadSize, payLoad);
    }

    encode(message) {
        let index = 0;
        let payload = message.payload;
        let byteArray = new Uint8Array(message.getHeaderSize() + 4 + payload.length);
        index = message.header2Bytes(byteArray, index);

        let payloadSize = payload.length;
        byteArray[index++] = payloadSize >>> 24;
        byteArray[index++] = payloadSize >>> 16;
        byteArray[index++] = payloadSize >>> 8;
        byteArray[index++] = payloadSize;

        if (message.payloadType == PayloadType.BINARY) {
            for (let i = 0; i < payloadSize; ++i) {
                byteArray[index++] = payload[i];
            }
        } else {
            for (let i = 0; i < payloadSize; ++i) {
                byteArray[index++] = payload.charCodeAt(i);
            }
        }
        return byteArray.buffer;
    }
}
module.exports = MessageFilter;