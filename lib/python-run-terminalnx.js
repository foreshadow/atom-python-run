/* global atom */
"use strict";

const path = require("path");
const child_process = require("child_process");

module.exports = {
    activate: () => {
        atom.commands.add("atom-text-editor", "Python run in terminal: run", run);
    },
    config: {
        a_terminal_selection: {
          title: "Select the Linux terminal emulator",
          description: "Linux terminal emulators supported are `gnome-terminal, konsole, xterm and uxterm`",
          type: "string",
          default: "gnome-terminal"
        },
        command_line_arguments: {
          title: "Python Command Line Arguments",
          description: "Enter the arguments separated by the pipe symbol (|). For example: `this is a string|7|1.82|True`",
          type: "string",
          default: ""
        },
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
    }
};

function run() {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
        return;
    }
    var file = editor.buffer.file;
    if (!file) {
        //if (!atom.config.get("python-run-terminal.disable_notifications_on_fail")) {
            atom.notifications.add("warning", "You have to create the file first.");
        //}
        return;
    }
    if (!atom.config.get("python-run-terminal.disable_notifications")) {
        atom.notifications.add("info", "Saving...");
    }
    editor.save();
    var info = path.parse(file.path);
    if (info.ext != ".py") {
        if (!atom.config.get("python-run-terminal.disable_notifications_on_fail")) {
            atom.notifications.add("warning", info.base + " is not a .py file, exit.");
        }
        return;
    }
    if (!atom.config.get("python-run-terminal.disable_notifications")) {
        atom.notifications.add("info", "Running " + info.base + " ...");
    }

    var sel_term = atom.config.get("python-run-terminal.a_terminal_selection")
    var ex_op = "-x"
    var c_l_a = atom.config.get("python-run-terminal.command_line_arguments")
    if (sel_term != "gnome-terminal") {
       var ex_op = "-e"
    }

    var child = child_process.spawn(sel_term, [
        ex_op, "/bin/bash", __dirname + "/../bin/run_python_code.sh", file.path, c_l_a
    ], {
        cwd: info.dir,
        detached: true
    });
    child.unref();
}
