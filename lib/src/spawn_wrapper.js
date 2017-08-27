

class SpawnWrapper {
    constructor(object) {

    }
}

class Type {
    constructor (object) {
        this.has_a_tty = object.has_a_tty;
        this.has_a_log = object.has_a_log;
        this.spawn_tty = object.spawn_tty;
    }
}
