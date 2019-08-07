# blockly-mynewt-rust

Create a Visual Embedded Rust program in a web browser and deploy it with Apache Mynewt to STM32 Blue Pill. 

Try it here: https://lupyuen.github.io/blockly-mynewt-rust/demos/code/

Watch the demo: https://youtu.be/5hWq5TDEpIg

Read the article: [_Visual Programming with Embedded Rust? Yes we can with Apache Mynewt and Google Blockly!_](https://medium.com/@ly.lee/visual-programming-with-embedded-rust-yes-we-can-with-apache-mynewt-and-google-blockly-8b67ef7412d7)

## Rust Code Generator

The following have been added into the existing [`generators`](generators) folder to generate Rust code and to add blocks specific to Mynewt...

[`generators/rust.js`](generators/rust.js): Main interface for Rust Code Generator

[`generators/rust`](generators/rust): Rust Code Generator for various blocks

## Demo for Rust Code Generator

The Blockly demo at [`demos/code`](demos/code) has been customised to include the Rust Code Generator...

## Visual Studio Code Extension

For easier code editing, this entire repository as been wrapped into the [visual-embedded-rust](https://github.com/lupyuen/visual-embedded-rust) Visual Studio Code Extension.

This repository is installed in the `media/blockly-mynewt-rust` folder of the extension.

[`demos/code/code.js`](demos/code/code.js): Customised to load the Rust Code Generator

# Blockly [![Build Status]( https://travis-ci.org/google/blockly.svg?branch=master)](https://travis-ci.org/google/blockly)


Google's Blockly is a web-based, visual programming editor.  Users can drag
blocks together to build programs.  All code is free and open source.

**The project page is https://developers.google.com/blockly/**

![](https://developers.google.com/blockly/images/sample.png)

Blockly has an active [developer forum](https://groups.google.com/forum/#!forum/blockly). Please drop by and say hello. Show us your prototypes early; collectively we have a lot of experience and can offer hints which will save you time.

Help us focus our development efforts by telling us [what you are doing with
Blockly](https://developers.google.com/blockly/registration). The questionnaire only takes
a few minutes and will help us better support the Blockly community.

Want to contribute? Great! First, read [our guidelines for contributors](https://developers.google.com/blockly/guides/modify/contributing).
