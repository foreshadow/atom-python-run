/* global atom */
"use strict";

const CompositeDisposable = require("atom").CompositeDisposable;
const path = require("path");
const child_process = require("child_process");

module.exports = {
    activate: () => {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(
            atom.commands.add("atom-text-editor", "Python run: run-f5", run_f5),
            atom.commands.add("atom-text-editor", "Python run: run-f6", run_f6)
        );
    },
    deactivate: () => {
        this.subscriptions.dispose();
    },
    config: {
        f5_command: {
            title: "Command of F5",
            description: "{file} stands for current file path",
            type: "string",
            default: "python.exe \"{file}\""
        },
        f6_command: {
            title: "Command of F6",
            description: "{file} stands for current file path",
            type: "string",
            default: "python.exe \"{file}\""
        },
        disable_notifications: {
            title: "Disable success notifications",
            description: "Disable notifications while saving and running",
            type: "boolean",
            default: false
        },
        disable_notifications_on_fail: {
            title: "Disable failure notifications",
            description: "Disable notifications when extension name does not match",
            type: "boolean",
            default: false
        }
    },
    subscriptions: null
};

function run_f5() {
    run(atom.config.get("atom-python-run.f5_command"));
}

function run_f6() {
    run(atom.config.get("atom-python-run.f6_command"));
}

function run(command) {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
        return;
    }
    var file = editor.buffer.file;
    if (!file) {
        notification("warning", "You have to create the file first.", true);
        return;
    }
    notification("info", "Saving...");
    editor.save();
    var info = path.parse(file.path);
    if (info.ext != ".py") {
        notification("warning", format("{0} is not a .py file, exit.", [info.base]));
        return;
    }
    notification("info", format("Running {0} ...", [info.base]));
    var ca = command.split(" ");
    ca.forEach(function(k, i, a) {
        a[i] = format(k, {
            "file": file.path,
            "dir": info.dir,
            "name": info.name,
            "ext": info.ext,
        });
    });
    var child = child_process.spawn("cmd", [
        "/c", "start", __dirname + "/../bin/cp.exe"
    ].concat(ca), {
        cwd: info.dir,
        detached: true
    });
    child.unref();
}

function notification(type, message, always) {
    if (type == "info") {
        if (always || !atom.config.get("atom-python-run.disable_notifications")) {
            atom.notifications.add("info", message);
        }
    } else if (type == "warning") {
        if (always || !atom.config.get("atom-python-run.disable_notifications_on_fail")) {
            atom.notifications.add("warning", message);
        }
    }
}

function format(string, array) {
    return string.replace(/{(.*?)}/g, k => array[k.substring(1, k.length - 1)]);
}
