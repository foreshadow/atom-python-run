"use strict";

var child_process = require("child_process");
var path = require("path");
var process = require("process");

module.exports = {
    activate: () => {
        atom.commands.add("atom-text-editor", "Python run: run", run);
    }
};

function run() {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
        return;
    }
    var file = atom.workspace.getActiveTextEditor().buffer.file.path;
    var info = path.parse(file);
    atom.notifications.add("info", "Saving " + info.base + " ...");
    editor.save();
    if (info.ext != ".py") {
        atom.notifications.add("warning", info.base + " is not a .py file, exit.");
        return;
    }
    atom.notifications.add("info", "Running " + info.base + " ...");
    var child = child_process.spawn("cmd", [
        "/c", "start", __dirname + "/../bin/cp.exe", "python.exe", "\"" + file + "\""
    ], {
        detach: true
    });
    child.unref();
}
