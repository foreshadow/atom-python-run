/* global atom */
"use strict";

const CompositeDisposable = require("atom").CompositeDisposable;
const path = require("path");
let terminal = require("./terminal");

// NOTE: win32 and linux only!
// NOTE: do not modify the has_a_tty properties on mac os x!
//
// terminal.type.spawns_tty executes these properties when called.
// each property can me modified according to your personal needs.
//
// modify the default shell
// terminal.type.has_a_tty.shell = "shell_name_here";
//
// modify the options passed to shell
// terminal.type.has_a_tty.option = "--options-go-here";
//
// modify the the command
// default (win32 only)
// if ("win32" === process.platform) terminal.type.has_a_tty.command = "start";
// default (darwin only)
// if ("darwin" === process.platform) {
//   const stringify = terminal.type.has_a_tty.command;
//   terminal.type.has_a_tty.command = stringify(...args);
// }

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
            default: "python {file}"
        },
        f6_command: {
            title: "Command of F6",
            description: "{file} stands for current file path",
            type: "string",
            default: "python {file}"
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
    // If a .py is not being run explicitly
  	if (command.indexOf(".py") === -1 && command.indexOf("{file}") > -1){
  		if (info.ext != ".py") {
  			notification("warning", format("{0} is not a .py file, exit.", [info.base]));
  			return;
  		}
  	}
    notification("info", format("Running {0} ...", [info.base]));
    var cmds = command.split(" ");
    cmds.forEach(function(k, i, a) {
        k = new String(k);
        a[i] = format(k, {
            "file": file.path,
            "dir": info.dir,
            "name": info.name,
            "ext": info.ext,
        });
    });
    let log = true;
    let options = {
            cwd: info.dir,
            detached: true,
    };
    cmds = [log, options, ...cmds];
    let tty = terminal.type.spawns_tty(...cmds);
    tty.unref();
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
