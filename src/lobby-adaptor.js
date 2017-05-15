'user strict';

/**
 * INTERFACE FOR LOBBY ADAPTOR
 */
class LobbyAdaptor {
    constructor(lobby){
        this._lobby = lobby;
    }
    get lobby() { return this._lobby; }
    get logger(){return this._lobby.logger; }

    handleUserJoin(user, handleResult){}
    onUserLeft(user){}
    onUserPaused(user){}
    onUserResumed(user){}
}

module.exports = LobbyAdaptor;