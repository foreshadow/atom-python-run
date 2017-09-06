#
# NOTE: 2to3 and 3to2 Compatability
# importing should consider 2to3 and 3to2 implications.
#
# https://stackoverflow.com/questions/85451/python-time-clock-vs-time-time-accuracy#85533
# https://docs.python.org/3/library/time.html#time.time
# https://docs.python.org/2.7/library/time.html#time.clock
# https://docs.python.org/2/library/timeit.html
# https://docs.python.org/2/library/sys.html#sys.platform
# https://docs.python.org/2/library/string.html#formatstrings
#
from __future__ import absolute_import
from __future__ import print_function
from os import system, environ
from os.path import isdir, dirname
from subprocess import call
from time import time
from sys import platform
import logging
from .parse import Parser


__all__ = (
    'set_log_path', 'set_namespace', 'set_command',
    'set_clock', 'print_clock',
    'pause'
)


version_info = "v0.1.1"


#
# NOTE:
# an improved methodology for determining the defaul log path is needed
#
def set_log_path():
    if 'win32' == platform:
        log = "{}\\.atom\\packages\\atom-python-run\\cp.log".format(environ['USERPROFILE'])
    else:
        log = "{}/.atom/packages/atom-python-run/cp.log".format(environ['HOME'])
    path = dirname(log)
    if not isdir(path):
        return "cp.log"
    return log


def set_namespace(args):
    parser = Parser(args)
    parser.check_args(args)
    parser.parse_opts()
    parser.parse_args()
    namespace = parser.get_namespace()
    for key, value in vars(namespace).items():
        logging.debug('namespace: key "%s": value "%s"', key, value)
    return namespace


def set_command(namespace):
    command = list()
    command.append(namespace.interpreter)
    for opt in namespace.options:
        command.append(opt)
    command.append(namespace.script)
    if namespace.pipe:
        command.append(namespace.pipe_file)
    logging.debug('command: %s', command)
    return command


def set_call(command, namespace, mode):
    code = None
    if namespace.pipe:
        with open(namespace.pipe_file, mode) as f:
            code = call(command, stdout=f, stderr=f)
            f.close()
    else:
        code = call(command)
    return code


def log_clock(code, clock):
    logging.info('return code: %d (0x%x)', code, code)
    logging.info('elapsed time: %.6f', clock)


def set_clock(command, namespace=None, mode='a'):
    clock = time()
    code = set_call(command, namespace, mode)
    clock = time() - clock
    log_clock(code, clock)
    return code, clock


def print_clock(code, clock):
    print("\nProcess returned {:d} (0x{:x})".format(code, code), end="\t")
    print("execution time : {:.3f} s".format(clock))


def pause():
    if 'win32' == platform:
        system('pause')
    elif 'darwin' == platform:
        system('echo "Close this window to continue..."')
    elif 'linux' == platform[:-1]:
        system("printf 'Press [ENTER] to continue...'; read _;")
    else:
        logging.info('Unknown OS Type: %s', platform)
