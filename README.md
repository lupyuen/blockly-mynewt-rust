# blockly-mynewt-rust

Create a Visual Embedded Rust program in a web browser and automatically generate Rust + Mynewt OS code for PineTime Smart Watch

Try it here: https://lupyuen.github.io/blockly-mynewt-rust/demos/code/

Sample XML (Copy into the XML Tab): https://github.com/lupyuen/blockly-mynewt-rust/blob/master/sample.xml

Watch the demo: https://youtu.be/5hWq5TDEpIg

Read the articles: 

1.  [_Visual Embedded Rust Programming with Visual Studio Code_](https://medium.com/@ly.lee/visual-embedded-rust-programming-with-visual-studio-code-1bc1262e398c?sk=222de63e45993aacd0db5a2e4b1f33c7)

2.  [_Advanced Topics for Visual Embedded Rust Programming_](https://medium.com/@ly.lee/advanced-topics-for-visual-embedded-rust-programming-ebf1627fe397?sk=01f0ae0e1b82efa9fd6b8e5616c736af)

3.  [_Visual Programming with Embedded Rust? Yes we can with Apache Mynewt and Google Blockly!_](https://medium.com/@ly.lee/visual-programming-with-embedded-rust-yes-we-can-with-apache-mynewt-and-google-blockly-8b67ef7412d7)

## PineTime Watch Apps

`blockly-mynewt-rust` create PineTime Watch Apps based on the druid UI framework...

[_Porting [druid] Rust Widgets to PineTime Smart Watch_](https://medium.com/@ly.lee/porting-druid-rust-widgets-to-pinetime-smart-watch-7e1d5a5d977a?source=friends_link&sk=09b153c68483f7fa9e63350efd167b07)

The generated Rust source file will be placed here for building...

https://github.com/lupyuen/pinetime-rust-mynewt/blob/dispatch/rust/app/src/visual.rs

## Type Inference

`#[infer_type]` is a Rust Procedural Macro that infers the missing types denoted by underscore (`_`) like this...

```rust
#[infer_type]  //  Infer the missing types
struct State {
    count: _,
}
...
state.count = 0;  //  `count` is inferred as integer type (i32)
```

The macro has being updated to support druid UI framework...

https://github.com/lupyuen/pinetime-rust-mynewt/blob/dispatch/rust/macros/src/infer_type.rs

## Static Widgets

`#[derive(Data)]` is a Rust Procedural Macro that generates custom data types (for Application State) in the druid UI framework...

https://github.com/lupyuen/druid-embedded/blob/master/druid-derive/src/data.rs

The macro has been extended to support Static Widgets on PineTime, which does not have heap storage...

https://github.com/lupyuen/druid-embedded/blob/master/druid-derive/src/widget.rs

## Rust Code Generator

The following have been added into the existing [`generators`](generators) folder to generate Rust code and to add blocks specific to Mynewt...

[`generators/rust.js`](generators/rust.js): Main interface for Rust Code Generator

[`generators/rust`](generators/rust): Rust Code Generator for various blocks

## Demo for Rust Code Generator

The Blockly demo at [`demos/code`](demos/code) has been customised to include the Rust Code Generator...

[`demos/code/code.js`](demos/code/code.js): Customised to load the Rust Code Generator

## Visual Studio Code Extension

For easier code editing, this entire repository as been wrapped into the [`visual-embedded-rust`](https://github.com/lupyuen/visual-embedded-rust) Visual Studio Code Extension.

This repository is installed in the `media/blockly-mynewt-rust` folder of the extension.

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
