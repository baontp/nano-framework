/**
 * Created by baonguyen on 4/13/2017.
 */

exports.Logger = require('nano-log');
exports.Server = require('./src/server');
exports.Services = require('./src/services');
exports.BaseRoom = require('./src/room');
exports.BaseUser = require('./src/user');

let constant = require('./src/constants');
exports.ServiceType = constant.ServiceType;
exports.MessageType = constant.MessageType;
exports.PayloadType = constant.PayloadType;
exports.ResultCode = constant.ResultCode;
exports.RoomType = constant.RoomType;
exports.RequestType = constant.RequestType;