# atom-python-run package
[![GitHub issues](https://img.shields.io/github/issues/foreshadow/atom-python-run.svg?style=plastic)](https://github.com/foreshadow/atom-python-run/issues)
[![GitHub stars](https://img.shields.io/github/stars/foreshadow/atom-python-run.svg?style=plastic)](https://github.com/foreshadow/atom-python-run/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/foreshadow/atom-python-run.svg?style=plastic)](https://github.com/foreshadow/atom-python-run/network)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=plastic)](https://raw.githubusercontent.com/foreshadow/atom-python-run/master/LICENSE.md)

Run your python (.py) source file using `F5` or `F6`!

![](https://cloud.githubusercontent.com/assets/2712675/18710388/9a665ed8-8037-11e6-803a-35e4555e89d0.jpg)

# Contents
- [Prerequisite](#prerequisite)
- [Features](#features)
- [Compatability](#compatibility)
- [Documentation](#documentation)
- [Issues](#issues)
- [Development](#development)

# Prerequisite

- Atom Text Editor (nightly or latest stable release)
- Python 2 and/or 3
- Add Python (and any other interpreters) to the `PATH` environment variable.

# Features

- Using `python`
  - Almost the same console with python IDLE, which provides syntax error and runtime error messages.
- CodeBlocks debug console style
  - Shows return value and execution time
    - It is a rough time based on real time rather than CPU kernel / user time

# Compatibility

- Cross Platform Compatible
  - Runs on Windows, Mac OS X, and Linux

- True Arbitrary Execution
  - Global python is the default interpreter
  - Execute using any interpreter
  - Pass options to the given interpreter
  - Pass arguments to the program to be executed

- Python 2 and 3
  - Note: If you have problems executing, you can install a global version of latest `python2.7.x` (even if you have `python3.x.x` installed). Please report any `python3` issues if you want to avoid installing a global `python2` version.

# Documentation

This project has been documented in a fair amount of detail over time. This documentation can be found in the [Wiki](https://github.com/foreshadow/atom-python-run/wiki).

**Everyone** should take the time to reveiw the [Wiki README](https://github.com/foreshadow/atom-python-run/wiki/00-Readme) at the bare minimum. It details an overview on how to handle issues, use different versions, and includes links to primary sections of the Wiki. 

**Everyone** should also take the time to review the Wiki section [How do I use atom-python-run?](https://github.com/foreshadow/atom-python-run/wiki/12-How-Do-I-Use-atom-python-run). It covers everything from installation, to configuration, logging, and much more. You just might be surprised by what you can do with atom-python-run.

You should have the basics after having covered both the *README* and *How Do I use atom-python-run?* sections. Most FAQ's can be resolved by simply reading them. The guides provided should allow us to help you with what ever issue you're facing.

**NOTE**: Be sure to read the [Wiki](https://github.com/foreshadow/atom-python-run/wiki) and the [Wiki README](https://github.com/foreshadow/atom-python-run/wiki/00-Readme) before reporting an issue or making a pull request. A lot of time has been put in to it to help you the user (or dev) get started and on your way.

# Issues
- Before newing an issue, check to see if someone else is experiencing any related issues.
- Check to see if any issues that were closed resemble your issue and re-open it addressing that you're experiencing a similar issue.
- Provide details about your issue, such as errors and/or logs.
- Provide reproduction steps (we can't help you if we don't know how to reproduce the error!).

# Development

If you're a developer and are interested in this project you can find this repos API's in the [Wiki](https://github.com/foreshadow/atom-python-run/wiki). More specifically, you'll want to take a look at [How does the cp module work?](https://github.com/foreshadow/atom-python-run/wiki#how-does-the-cp-module-work) and [How does the terminal.js module work?](https://github.com/foreshadow/atom-python-run/wiki#how-does-the-terminal-module-work) sections of the Wiki.

You can also just read the key source files
- [cp](https://github.com/foreshadow/atom-python-run/tree/master/cp) (cp is written in python)
- [terminal.js](https://github.com/foreshadow/atom-python-run/blob/master/lib/terminal.js)
- [atom-python-run.js](https://github.com/foreshadow/atom-python-run/blob/master/lib/atom-python-run.js)
- New an issue if you have any idea of new features.

![A screenshot of your package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)

This is a package for Atom
