/**
 * Created by baonguyen on 4/13/2017.
 */
exports.Logger = require('nano-log');
exports.MessageBuilder = require('./src/message-builder');
exports.Server = require('./src/server');
exports.Services = require('./src/services');
exports.BaseDomain = require('./src/domain');
exports.BaseRoom = require('./src/room');
exports.BaseUser = require('./src/user');
exports.HandleResult = require('./src/handle-result');

let constant = require('./src/constants');
exports.ServiceType = constant.ServiceType;
exports.MessageType = constant.MessageType;
exports.PayloadType = constant.PayloadType;
exports.ResultCode = constant.ResultCode;
exports.RoomType = constant.RoomType;
exports.RequestType = constant.RequestType;
exports.NotifyType = constant.NotifyType;