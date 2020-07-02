# verilog-autoline

## Features

This Extension is help to edit verilog-file
* Make align better at 'input', 'output', 'wire', 'reg' ....
* verliog-mode (EMACS) batch script run
    * verilog-auto
    * verilog-delete-auto
* Add Comment Line (Type, Line Number, Line Length)
    * ex) //======================================   <- "=/1/40"
    * ex) //--------------------------------------   <- "-/1/40"


## Keybinings

Defalut keybindings

* `ctrl+l`  - Auto Line
* `ctrl+alt+l` - Auto Line2
* `ctrl+f11` - Make VIM folding code
* `ctrl+k ctrl+/` - Add Line comment 

No Keybinding
* verilog-auto
* verilog-delete-auto

## Known Issues

Under developing

## Release Notes

Initial Release

### 0.0.0

Initial release of verilog-autoline

### 0.1.0

Emacs verilog-mode function Added
- verilog-auto
- verilog-delete-auto

## 0.2.0

- Auto Line Case Added Shift `(` or `)`

## 0.3.0

- Add "bit" "logic"

## 0.4.0

- Add MultiLine Comment Divider Command