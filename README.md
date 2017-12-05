# atom-python-run package
[![GitHub issues](https://img.shields.io/github/issues/foreshadow/atom-python-run.svg?style=plastic)](https://github.com/foreshadow/atom-python-run/issues)
[![GitHub stars](https://img.shields.io/github/stars/foreshadow/atom-python-run.svg?style=plastic)](https://github.com/foreshadow/atom-python-run/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/foreshadow/atom-python-run.svg?style=plastic)](https://github.com/foreshadow/atom-python-run/network)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=plastic)](https://raw.githubusercontent.com/foreshadow/atom-python-run/master/LICENSE.md)

Run your python (.py) source file using `F5` or `F6`!

![](https://cloud.githubusercontent.com/assets/2712675/18710388/9a665ed8-8037-11e6-803a-35e4555e89d0.jpg)

# Contents
- [Prerequisite](https://github.com/foreshadow/atom-python-run#prerequisite)
- [Method of use](https://github.com/foreshadow/atom-python-run#method-of-use)
- [Features](https://github.com/foreshadow/atom-python-run#features)
- [Settings](https://github.com/foreshadow/atom-python-run#settings)
- [Compatability](https://github.com/foreshadow/atom-python-run#compatibility)
- [Documentation](https://github.com/foreshadow/atom-python-run/wiki)
- [Issues](https://github.com/foreshadow/atom-python-run#issues)
- [Logs](https://github.com/foreshadow/atom-python-run#logs)
- [Development](https://github.com/foreshadow/atom-python-run#development)

# Prerequisite

- Atom Text Editor (nightly or latest stable release)
- Python 2 and/or 3
- Add Python (and any other interpreters) to the `PATH` environment variable.

# Method of use

1. Open a source file.
2. Hit `F5` or `F6` to run.
  - **It will save the file in current editor immediately without a confirmation, be aware.**

# Features

- Using `python`
  - Almost the same console with python IDLE, which provides syntax error and runtime error messages.
- CodeBlocks debug console style
  - Shows return value and execution time
    - It is a rough time based on real time rather than CPU kernel / user time

# Settings

- Extension filter
  - Accepts all file extensions by default (empty value), you can change it into `.py`
    - or an array `.py, .js, .something-else`

- Command
  - You can hack it using these variant, or
    - `{file}` = `{dir}/{name}{ext}`
  - Run with interactive mode, or
    - `python -i {file}`
  - Run with idle, and you may need the next setting.
    - `pythonw C:\python27\Lib\idlelib\idle.pyw -r {file}`
  - Pass arguments
    - `python {file} these are arguments for file`
  - Pause
    - Show elapsed time and pause `cp`
      - Exit immediately
      - You can disable the default cp wrapper if you don't want it.
- Pipe to File
  - Redirect standard output to a file instead of the screen
    - Name the path and file to write to
      - `/some/file/path/to/my-programs-output.txt`
    - Create the file in the current working directory by omitting a path
      - `my-programs-output.txt`
- Terminal
  - Left empty by default (uses the systems default terminal)
  - Choose the type of terminal you'd like to use instead
    - `terminator, -x`

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

# Issues
- Before newing an issue, check to see if someone else is experiencing any related issues.
- Check to see if any issues that were closed resemble your issue and re-open it addressing that you're experiencing a similar issue.
- Provide details about your issue, such as errors and/or logs.
- Provide reproduction steps (we can't help you if we don't know how to reproduce the error!).

# Logs
- The `atom-python-run` plug-in fully supports logging.
  - Please post these logs along with any issue you're experiencing (we can't help you if we don't know what's happening!).
  - Note that there are 2 logs in case the latter fails. The first log is the console log and the second log is created by the cp main.py executable.

- How to access Atoms Console Log
  - Windows/Linux
    - Ctrl + Shift + I
  - Mac OS X
    - Cmd + Alt + I
  - Click on the `console` tab
  - Copy and paste the console output along with your post.

- How to access `cp`'s built-in log
  - Windows
    1. Open file explorer
    2. Click the location bar (where the file path usually is)
    3. Type in `%userprofile%\.atom\packages\atom-python-run`
    4. Locate, Open, and Copy the contents of the cp.log file along with your post.
  - Mac OS X/Linux
    1. Open a terminal window.
    2. `$ cat ~/.atom/packages/atom-python-run/cp.log`
    3. Copy and paste the contents along with your post.
  - NOTE: If the `cp.log` file is missing, empty, or inaccurate, please note that this was case in your post.

- Detailed issues are well presented issues. This will help us remedy the problem.

# Development
- New an issue if you have any idea of new features.

![A screenshot of your package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)

This is a package for Atom
