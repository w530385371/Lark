//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
/// <reference path="../lib/types.d.ts" />
require('../locales/zh_CN');
var Parser = require("./Parser");
var Build = require("../build/index");
var Publish = require("./Publish");
var Create = require("./Create");
var FileUtil = require('../lib/FileUtil');
var server = require('../server/server');
var http = require('http');
var childProcess = require('child_process');
global.lark = global.lark || {};
var DontExitCode = -0xF000;
function executeCommandLine(args) {
    var options = Parser.parseCommandLine(args);
    lark.options = options;
    entry.executeOption(options);
}
exports.executeCommandLine = executeCommandLine;
function executeOption(options) {
    return entry.executeOption(options);
}
exports.executeOption = executeOption;
var Entry = (function () {
    function Entry() {
    }
    Entry.prototype.executeOption = function (options) {
        var exitCode = 0;
        switch (options.action) {
            case "publish":
                var publish = new Publish(options);
                exitCode = publish.run();
                break;
            case "create":
                var create = new Create(options);
                create.run();
                server.startServer(options, options.manageUrl + "create/");
                exitCode = DontExitCode;
                break;
            case "config":
                server.startServer(options, options.manageUrl + "config/");
                exitCode = DontExitCode;
                break;
            case "run":
                server.startServer(options);
                exitCode = DontExitCode;
                break;
            case "buildLark":
                var build = new Build(options);
                build.buildLarkSource();
                break;
            case "shutdown":
                this.exit(0);
                break;
            case "buildService":
                var build = new Build(options);
                exitCode = build.run();
                break;
            default:
                sendBuildCMD();
                break;
        }
        return exitCode;
    };
    Entry.prototype.exit = function (exitCode) {
        if (DontExitCode == exitCode)
            return;
        process.exit(exitCode);
    };
    return Entry;
})();
var entry = new Entry();
var serviceCreated = false;
function sendBuildCMD(callback) {
    var options = lark.options;
    var requestUrl = 'http://127.0.0.1:51598/?path=' + encodeURIComponent(options.projectDir);
    var commandRequest = http.get(requestUrl, function (res) {
        res.setEncoding('utf-8');
        res.on('data', function (text) {
            gotCommandResult(text, callback);
        });
    });
    commandRequest.once('error', function (e) {
        if (!serviceCreated) {
            startBackgroundService();
            serviceCreated = true;
        }
        setTimeout(function () { return sendBuildCMD(callback); }, 200);
    });
    commandRequest.setTimeout(100);
}
exports.sendBuildCMD = sendBuildCMD;
function startBackgroundService() {
    console.log('create service');
    var options = lark.options;
    var nodePath = process.execPath, service = FileUtil.joinPath(options.larkRoot, 'tools/service/index');
    var startupParams = ['--expose-gc', service];
    this.server = childProcess.spawn(nodePath, startupParams, {
        detached: true,
        stdio: ['ignore', 'ignore', 'ignore'],
        cwd: process.cwd(),
        silent: true
    });
}
function gotCommandResult(msg, callback) {
    var cmd = JSON.parse(msg);
    if (cmd.messages) {
        cmd.messages.forEach(function (m) { return console.log(m); });
    }
    if (callback) {
        callback(cmd);
    }
    else {
        process.exit(cmd.exitCode || 0);
    }
}
//# sourceMappingURL=Entry.js.map