/**
 * Created by baonguyen on 5/3/2017.
 */
class Domain {
    constructor(maxUser) {
        this._users = new Map();
        this._maxUser = maxUser || 999999999;
    }

    get isFull(){ return this._users.size >= this._maxUser; }

    broadcast(msg, excludes) {
        if (!!excludes) {
            let _users = Array.from(this._users.values()).filter(function (user) {
                return excludes.indexOf(user) == -1;
            });
            _users.forEach(function (user) {
                user.sendMessage(msg);
            });
        } else {
            for (let user of this._users.values()) {
                user.sendMessage(msg);
            }
        }
    }

    traverseAllUsers(cb) {
        this._users.forEach(cb);
    }

    findUserByName(name) {
        for (let user of this._users.values()) {
            if (user.name == name) return user;
        }
    }

    checkUserJoined(user) {
        return this._users.has(user.id);
    }

    _addUser(user) {
        if(this.isFull) return false;
        this._users.set(user.id, user);
        return true;
    }

    _removeUser(user) {
        return this._users.delete(user.id);
    }
}

module.exports = Domain;