#
# NOTE:
# importing should consider 2to3 and 3to2 implications.
#
# for both backwards and forwards compatability, print_function and clock
# are imported to prevent incompatability issues that may arrise.
#
# clock() is deprecated in python >= 3.3
# process_time has not been ported back to 2.x
# source: https://stackoverflow.com/questions/85451/python-time-clock-vs-time-time-accuracy#85533
#
# for all intents and purposes, clock functions very much the same as it does
# in both C and C++
# source: https://docs.python.org/2.7/library/time.html#time.clock
#
# to avoid naming conflicts, process_time is imported as clock for 3.3 onwards
#
# for measuring snippets and algorithms, the built-in timeit module should be used instead
# source: https://docs.python.org/2/library/timeit.html
#
from __future__ import print_function
from os import system
from sys import argv, platform
from parse import Parser

try:
    from time import process_time as clock
except ImportError:
    from time import clock

if __name__ == '__main__':
    parser = Parser(argv)
    parser.check_args(argv)
    parser.parse_opts()
    parser.parse_args()
    namespace = parser.get_namespace()
    command = list()
    command.append(namespace.interpreter)

    for opt in namespace.options:
        command.append(opt)

    command.append(namespace.script)

    if namespace.pipe:
        command.append(namespace.pipe_symbol)
        command.append(namespace.pipe_file)

    # print(' '.join(command))
    command = ' '.join(command)

    # clock()s value depends on the CPU, Arch type, OS, etc...
    # this means the value returned by clock() is indeterminate

    # the common averages for the given systems are
    # on win32, this is a microsecond or 1/1000000 of a second
    # on linux, this is a millisecond or 1/1000 of a second
    t = clock()
    r = system(command)
    t = clock() - t
    if 'win32' == platform:
        t /= 1000000.
    else:
        t /= 1000.

    # for compatability, format is used instead of the % (print) modifier
    # https://docs.python.org/2/library/string.html#formatstrings
    print(
        "\nProcess returned {:d} (0x{:x})\texecution time : {:.6f} s\n",
        r, r, t
    )

    if 'win32' == platform:
        system('pause')
    elif 'darwin' == platform:
        system('echo "Close this window to continue..."')
    elif 'linux' == platform:
        system("printf 'Press [ENTER] to continue...'; read _;")

    exit(r)
