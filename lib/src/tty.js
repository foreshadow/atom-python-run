
const linux = require('./linux');


let LinuxTTY = function () {
    this.shell = linux.terminal.name;
    this.option = [linux.terminal.option];
    this.call = 'python';
    this.script = `${process.env.HOME}/.atom/packages/atom-python-run/cp/main.py`;
};


let Win32TTY = function () {
    this.shell = process.env.COMSPEC;
    this.option = ['/c', 'start'];
    this.call = 'python';
    this.script = `${process.env.USERPROFILE}\\.atom\\packages\\atom-python-run\\cp\\main.py`;
};


let DarwinTTY = function () {
    this.shell = 'osascript';
    this.option = '-e';
    this.call = 'python'
    this.script = `${process.env.HOME}/.atom/packages/atom-python-run/cp/main.py`;
    this.command = function (...args) {
        let path = this.call + " " + this.script;
        for (let token of args) {
            path += ` ${token}`;
        }
        return `tell app "Terminal" to do script "${path}"`
    };
};


let has_a_tty = function () {
    switch (process.platform) {
        case 'linux':
            return new LinuxTTY();
        case 'darwin':
            return new DarwinTTY();
        case 'win32':
            return new Win32TTY();
    }
};


exports.has_a_tty = has_a_tty();
