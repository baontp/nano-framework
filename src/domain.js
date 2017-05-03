/**
 * Created by baonguyen on 5/3/2017.
 */
class Domain {
    constructor(maxUser) {
        this._users = new Map();
        this._maxUser = maxUser || 999999999;
    }

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

    checkUserJoined(userId) {
        return this._users.has(userId);
    }

    addUser(user) {
        this._users.set(user.id, user);
    }

    removeUser(userId) {
        return this._users.delete(userId);
    }
}

module.exports = Domain;