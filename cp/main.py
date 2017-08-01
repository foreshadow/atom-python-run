# NOTE: basicConfig is only called once
#
# NOTE: basicConfig()s filemode parameter
# filemode is set to write to avoid an overly sized log file.
#
# if the file is truncated in such a way that is unsuitable,
# just remove the filemode argument from the basicConfig call.
#
from __future__ import print_function
from sys import argv, platform
from logging import basicConfig, DEBUG, info
from cp import cplib


if __name__ == '__main__':
    logpath = cplib.set_logpath()

    basicConfig(filename=logpath, filemode='w', level=DEBUG, format='%(levelname)s: %(message)s')

    info('OS Type: %s', platform)

    info('Version Info: %s', cplib.version_info)

    namespace = cplib.set_namespace(argv)

    command = cplib.set_command(namespace)

    code, time = cplib.set_clock(command)

    cplib.print_clock(code, time)

    cplib.pause()

    exit(code)
