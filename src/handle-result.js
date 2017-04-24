'use strict';

class HandleResult {
    constructor() {
        this.code = 0;
        this.skipResponse = false;
        this.skipNotify = false;
        this.message = "";
    }
}

module.exports = HandleResult;