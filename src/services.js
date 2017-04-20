'use strict';

let HashMap = require('hashmap');

let constants = require('./constants');
let ServiceType = constants.ServiceType;

class Services {
    constructor() {
        this._serviceMap = new HashMap();
        this._serviceMap.set(ServiceType.USER_AUTH, UserAuthService);
    }

    setUserAuthenticateService(service) {
        this._serviceMap.set(ServiceType.USER_AUTH, service);
    }

    addService(id, service) {
        this._serviceMap.set(id, service);
    }

    getService(id) {
        return this._serviceMap.get(id);
    }
}

let UserAuthService = {
    authenticateUser (user, authData, handleResult) {
        return new Promise(function(resolve){
            resolve(handleResult);
        });
    }
};

module.exports = Services;

