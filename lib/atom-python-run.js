/* global atom */
"use strict";

const path = require("path");
const child_process = require("child_process");

module.exports = {
    activate: () => {
        atom.commands.add("atom-text-editor", "Python run: run", run);
    },
    config: {
        disable_notifications: {
          title: "Disable notifications on success",
          description: "Disable saving and running notifications",
          type: "boolean",
          default: false
        }
    }
};

function run() {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
        return;
    }
    var file = editor.buffer.file.path;
    var info = path.parse(file);
    if (!atom.config.get("atom-python-run.disable_notifications")) {
        atom.notifications.add("info", "Saving " + info.base + " ..."); 
    }
    editor.save();
    if (info.ext != ".py") {
        atom.notifications.add("warning", info.base + " is not a .py file, exit.");
        return;
    }
    if (!atom.config.get("atom-python-run.disable_notifications")) {
        atom.notifications.add("info", "Running " + info.base + " ...");
    }
    var child = child_process.spawn("cmd", [
        "/c", "start", __dirname + "/../bin/cp.exe", "python.exe", "\"" + file + "\""
    ], {
        cwd: info.dir,
        detached: true
    });
    child.unref();
}
