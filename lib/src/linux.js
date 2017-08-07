
let shell = function () {
    switch (process.env.GDMSESSION) {
        // if session is using gtk
        case 'ubuntu':
        case 'ubuntu-2d':
        case 'gnome':
        case 'gnome-shell':
        case 'gnome-classic':
        case 'gnome-fallback':
        case 'cinnamon':
            return "gnome-terminal";
        // xfce session has its own terminal, xfce is gtk compatible
        case 'xfce':
            return "xfce4-terminal";
        // if session is using qt, kde and lxde are qt compatible
        case 'kde-plasma':
            return "konsole";
        case 'Lubuntu':
            return "lxterminal";
        default:
            // attempt to determine desktop session
            switch (process.env.XDG_CURRENT_DESKTOP) {
                case 'Unity':
                case 'GNOME':
                case 'X-Cinnamon':
                    return "gnome-terminal";
                case 'XFCE':
                    return "xfce4-terminal";
                case 'KDE':
                    return "konsole";
                case 'LXDE':
                    return "lxterminal";
                // if unknown session, default to xterm
                default:
                    return "xterm";
            }
    }
};


let shell_option = function (shell) {
    // determine the shells default execution option
    switch (shell) {
        case 'gnome-terminal':
        case 'xfce4-terminal':
            return "-x"
        case 'konsole':
        case 'lxterminal':
        default:
            return "-e"
    }
};


let Terminal = function (name, option) {
    this.name = name;
    this.option = option;
};


let name = shell();
let option = shell_option(name);

exports.terminal = new Terminal(name, option);
