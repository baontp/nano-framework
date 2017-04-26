'use strict';
/**
 * Created by baonguyen on 4/6/2017.
 */
let RoomType = {};
exports.RoomType = RoomType;
RoomType[RoomType['NORMAL'] = 0] = 'NORMAL';
RoomType[RoomType['LOBBY'] = 1] = 'LOBBY';

let MessageType = {};
exports.MessageType = MessageType;
MessageType[MessageType['REQUEST'] = 0] = 'REQUEST';
MessageType[MessageType['RESPONSE'] = 1] = 'RESPONSE';
MessageType[MessageType['UPDATE'] = 2] = 'UPDATE';


let PayloadType = {};
exports.PayloadType = PayloadType;
PayloadType[PayloadType['JSON'] = 0] = 'JSON';
PayloadType[PayloadType['BINARY'] = 1] = 'BINARY';


let ResultCode = {};
exports.ResultCode = ResultCode;
ResultCode[ResultCode['SUCCESS'] = 0] = 'SUCCESS';
ResultCode[ResultCode['BAD_REQUEST'] = 1] = 'BAD_REQUEST';
ResultCode[ResultCode['AUTH_ERROR'] = 2] = 'AUTH_ERROR';
ResultCode[ResultCode['BANNED_FROM_ROOM'] = 3] = 'BANNED_FROM_ROOM';
ResultCode[ResultCode['REQUEST_FAILED'] = 4] = 'REQUEST_FAILED';
ResultCode[ResultCode['INSUFFICIENT_MONEY'] = 5] = 'INSUFFICIENT_MONEY';
ResultCode[ResultCode['SERVICE_UNAVAILABLE'] = 6] = 'SERVICE_UNAVAILABLE';
ResultCode[ResultCode['SESSION_OVERRIDE'] = 7] = 'SESSION_OVERRIDE';

let RequestType = {};
exports.RequestType = RequestType;
RequestType[RequestType['AUTHENTICATE_USER'] = 0] = 'AUTHENTICATE_USER';
RequestType[RequestType['USER_ACTION'] = 1] = 'USER_ACTION';
RequestType[RequestType['CREATE_ROOM'] = 2] = 'CREATE_ROOM';
RequestType[RequestType['JOIN_ROOM'] = 3] = 'JOIN_ROOM';
RequestType[RequestType['LEAVE_ROOM'] = 4] = 'LEAVE_ROOM';
RequestType[RequestType['FIND_ROOM'] = 5] = 'FIND_ROOM';

let UpdateType = {};
exports.UpdateType = UpdateType;

let NotifyType = {};
exports.NotifyType = NotifyType;
NotifyType[NotifyType['USER_ACTION'] = 1] = 'USER_ACTION';

let ServiceType = {};
exports.ServiceType = ServiceType;
ServiceType[ServiceType['USER_AUTH'] = 0] = 'USER_AUTH';