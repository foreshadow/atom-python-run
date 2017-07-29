from __future__ import print_function
from os import system
from sys import argv
from parse import Parser


if __name__ == '__main__':
    parser = Parser(argv)
    parser.check_args(argv)
    parser.parse_opts()
    parser.parse_args()
    namespace = parser.get_namespace()
    command = list()
    print(namespace.interpreter)
    command.append(namespace.interpreter)

    for opt in namespace.options:
        command.append(opt)

    command.append(namespace.script)

    if namespace.pipe:
        command.append(namespace.pipe_symbol)
        command.append(namespace.pipe_file)

    print(' '.join(command))
    # command = ' '.join(command)

    # r = system(command)
