'use strict';

let path = require('path'),
    fs = require('fs'),
    util = require('util');

let dateFormat = require('dateformat');

let makeArray = function (nonarray) {
    return Array.prototype.slice.call(nonarray);
};

// Create a new instance of Logger, logging to the file at `log_file_path`
// if `log_file_path` is null, log to STDOUT.
class Logger {
    constructor(tag) {
        this._tag = tag.toUpperCase() || '';
        this._prefix = '';
    }

    set prefix(prefix) {
        this._prefix = prefix;
    }

    write(text) {
        if (Logger._stream) {
            Logger._stream.write(text + '\r\n');
        } else {
            console.log(text);
        }
    };

    // The default log formatting function. The default format looks something like:
    //
    //    [2017-03-30 15:01:00]	[LEVEL]	[TAG]	 message
    //
    format(level, date, message) {
        if (this._prefix.length > 0) {
            return [
                '[', dateFormat(date, 'yyyy-mm-dd HH:MM:ss'), ']\t',
                '[', level.toUpperCase(), ']\t',
                '[', this._tag, ']\t',
                '[', this._prefix, ']\t',
                message].join('');
        } else {
            return [
                '[', dateFormat(date, 'yyyy-mm-dd HH:MM:ss'), ']\t',
                '[', level.toUpperCase(), ']\t',
                '[', this._tag, ']\t',
                message].join('');
        }
    }

    // The base logging method. If the first argument is one of the levels, it logs
    // to that level, otherwise, logs to the default level. Can take `n` arguments
    // and joins them by ' '. If the argument is not a string, it runs `sys.inspect()`
    // to print a string representation of the object.
    log() {
        let args = makeArray(arguments),
            log_index = Logger.levels.indexOf(args[0]),
            message = '';

        // if you're just default logging
        if (log_index === -1) {
            log_index = LOGGER_LEVEL;
        } else {
            // the first arguement actually was the log level
            args.shift();
        }
        if (log_index <= LOGGER_LEVEL) {
            // join the arguments into a loggable string
            args.forEach(function (arg) {
                if (typeof arg === 'string') {
                    message += ' ' + arg;
                } else {
                    message += ' ' + util.inspect(arg, false, null);
                }
            });
            message = this.format(Logger.levels[log_index], new Date(), message);
            this.write(message);
            return message;
        }
        return false;
    }
}

Logger.levels = ['fatal', 'error', 'warn', 'info', 'debug'];

exports.initLogFile = function (filename) {
    Logger._filename = filename;
    Logger._stream = null;
    _initLogFile();
};

let _initLogFile = function () {
    if (WRITE_FILE) {
        let delayedTime = 3600000 - ((new Date()).getTime() % 3600000);
        // let delayedTime = 60000 - ((new Date()).getTime() % 60000);
        setTimeout(_initLogFile, delayedTime);

        let logExtend = '.log';
        let logFile = '../log/' + Logger._filename + '_';
        let dateString = dateFormat(new Date(), 'yyyymmdd');
        // let dateString = dateFormat(new Date(), 'yyyymmdd_HHMM');

        let logFilePath = logFile + dateString + logExtend;
        logFilePath = path.normalize(logFilePath);
        if (Logger._stream) {
            Logger._stream.close();
        }
        Logger._stream = fs.createWriteStream(logFilePath, {flags: 'a', encoding: 'utf8', mode: 0o666});
        Logger._stream.write("\n");
    }
};

Logger.levels.forEach(function (level) {
    Logger.prototype[level] = function () {
        let args = makeArray(arguments);
        args.unshift(level);
        return this.log.apply(this, args);
    };
});

// exports.Logger = Logger;
let LOGGER_LEVEL = 3;
let WRITE_FILE = true;
/**
 * set global logger level ['fatal', 'error', 'warn', 'info', 'debug']
 * @param new_level
 * @returns {*}
 */
exports.setLevel = function (new_level) {
    let index = Logger.levels.indexOf(new_level);
    return (index != -1) ? LOGGER_LEVEL = index : false;
};

exports.createLogger = function (tag) {
    return new Logger(tag);
};