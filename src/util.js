'use strict';

exports.generateNumber = () => {
    let val = Math.random() * 10000;
    let i = parseInt(val.toFixed());
    val = (((val % 1) * 100000000000000) + i);
    return parseInt(val.toFixed());
};

exports.hex2bin = function (hex) {
    let bytes = [], str;

    for (let i = 0; i < hex.length - 1; i += 2)
        bytes.push(parseInt(hex.substr(i, 2), 16));

    return String.fromCharCode.apply(String, bytes);
};

exports.base64_encode = function (data) {
    let b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];

    if (!data) {
        return data;
    }

    do {
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    let r = data.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
};

exports.bin2String = function (array) {
    let str = "";
    for (let i = 0; i < array.length; i++) {
        let char = array[i];
        str += String.fromCharCode(char);
    }
    return str;
};

exports.string2bin = function (str) {
    let strLen = str.length;
    let data = new Uint8Array(strLen);
    for (let i = 0; i < strLen; ++i) {
        data[i] = str.charCodeAt(i);
    }
    return data;
};

exports.bytesToInt = function (bytes, offset) {
    let value = 0;
    for (let i = 0; i < 4; i++) {
        value = (value << 8) + (bytes[offset + i] & 0xff);
    }

    return value;
};

exports.intToBytes = function (number, bytes, offset) {
    let _offset = offset || 0;
    bytes[_offset] = number >>> 24;
    bytes[_offset + 1] = number >>> 16;
    bytes[_offset + 2] = number >>> 8;
    bytes[_offset + 3] = number;

    return _offset + 4;
};