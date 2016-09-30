/* global atom */
"use strict";

const CompositeDisposable = require("atom").CompositeDisposable;
const path = require("path");
const child_process = require("child_process");

module.exports = {
    activate: () => {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(
            atom.commands.add("atom-text-editor", "Python run: run", run)
        );
    },
    deactivate: () => {
        this.subscriptions.dispose();
    },
    config: {
        disable_notifications: {
            title: "Disable notifications of success",
            description: "Disable notifications of saving and running",
            type: "boolean",
            default: false
        },
        disable_notifications_on_fail: {
            title: "Disable notifications of failure",
            description: "Disable notifications of extension name does not match",
            type: "boolean",
            default: false
        }
    },
    subscriptions: null
};

function run() {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
        return;
    }
    var file = editor.buffer.file;
    if (!file) {
        //if (!atom.config.get("atom-python-run.disable_notifications_on_fail")) {
        atom.notifications.add("warning", "You have to create the file first.");
        //}
        return;
    }
    if (!atom.config.get("atom-python-run.disable_notifications")) {
        atom.notifications.add("info", "Saving...");
    }
    editor.save();
    var info = path.parse(file.path);
    if (info.ext != ".py") {
        if (!atom.config.get("atom-python-run.disable_notifications_on_fail")) {
            atom.notifications.add("warning", info.base + " is not a .py file, exit.");
        }
        return;
    }
    if (!atom.config.get("atom-python-run.disable_notifications")) {
        atom.notifications.add("info", "Running " + info.base + " ...");
    }
    var child = child_process.spawn("cmd", [
        "/c", "start", __dirname + "/../bin/cp.exe", "python.exe", "\"" + file.path + "\""
    ], {
        cwd: info.dir,
        detached: true
    });
    child.unref();
}
