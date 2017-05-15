'user strict';

/**
 * INTERFACE FOR ROOM ADAPTOR
 */
class RoomAdaptor {
    constructor(room){
        this._room = room;
    }
    get room() { return this._room; }
    get logger(){return this._room.logger; }

    handleUserJoin(user, handleResult){}
    onUserLeft(user){}
    onUserPaused(user){}
    onUserResumed(user){}
}

module.exports = RoomAdaptor;