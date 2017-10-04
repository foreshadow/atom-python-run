# Copyright (C) 2017
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# <https://www.gnu.org/licenses/gpl-2.0.txt>
#
# NOTE: basicConfig is only called once
#
# NOTE: basicConfig()s filemode parameter
# filemode is set to write to avoid an overly sized log file.
#
# if the file is truncated in such a way that is unsuitable,
# just remove the filemode argument from the basicConfig call.
# by default, filemode is already set to append.
#
from __future__ import absolute_import
from __future__ import print_function
from sys import argv, platform
from logging import basicConfig, DEBUG, info
from cp.parse import Parser
from cp.utils import clear

version_info = "v0.2.0"

if __name__ == '__main__':
    parser = Parser()

    parser.setLogPath()

    logpath = parser.getLogPath()

    basicConfig(
        filename=logpath,
        filemode='w',
        level=DEBUG,
        format='%(levelname)s: %(message)s'
    )

    info('Platform: %s', platform)

    info('Version Info: %s', version_info)

    parser.logLogPath()

    parser.setLexer(argv)

    parser.setNamespace()

    namespace = parser.getNamespace()

    parser.setCommand()

    clear()

    if namespace['file']:
        parser.pipeCall('a')
    else:
        parser.call('a')

    parser.logClock()

    if namespace['pause']:
        parser.printClock()
        parser.pause()

    exit(parser.exitCode())
