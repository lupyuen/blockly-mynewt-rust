/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2014 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating Rust for blocks.
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

goog.provide('Blockly.Rust');

goog.require('Blockly.Generator');


/**
 * Rust code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Rust = new Blockly.Generator('Rust');

/** TODO
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Rust.addReservedWords(
    // https://www.dartlang.org/docs/spec/latest/dart-language-specification.pdf
    // Section 16.1.1
    'assert,break,case,catch,class,const,continue,default,do,else,enum,' +
    'extends,false,final,finally,for,if,in,is,new,null,rethrow,return,super,' +
    'switch,this,throw,true,try,var,void,while,with,' +
    // https://api.dartlang.org/dart_core.html
    'print,identityHashCode,identical,BidirectionalIterator,Comparable,' +
    'double,Function,int,Invocation,Iterable,Iterator,List,Map,Match,num,' +
    'Pattern,RegExp,Set,StackTrace,String,StringSink,Type,bool,DateTime,' +
    'Deprecated,Duration,Expando,Null,Object,RuneIterator,Runes,Stopwatch,' +
    'StringBuffer,Symbol,Uri,Comparator,AbstractClassInstantiationError,' +
    'ArgumentError,AssertionError,CastError,ConcurrentModificationError,' +
    'CyclicInitializationError,Error,Exception,FallThroughError,' +
    'FormatException,IntegerDivisionByZeroException,NoSuchMethodError,' +
    'NullThrownError,OutOfMemoryError,RangeError,StackOverflowError,' +
    'StateError,TypeError,UnimplementedError,UnsupportedError'
);

/** TODO
 * Order of operation ENUMs.
 * https://www.dartlang.org/docs/dart-up-and-running/ch02.html#operator_table
 */
Blockly.Rust.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Rust.ORDER_UNARY_POSTFIX = 1;  // expr++ expr-- () [] . ?.
Blockly.Rust.ORDER_UNARY_PREFIX = 2;   // -expr !expr ~expr ++expr --expr
Blockly.Rust.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Blockly.Rust.ORDER_ADDITIVE = 4;       // + -
Blockly.Rust.ORDER_SHIFT = 5;          // << >>
Blockly.Rust.ORDER_BITWISE_AND = 6;    // &
Blockly.Rust.ORDER_BITWISE_XOR = 7;    // ^
Blockly.Rust.ORDER_BITWISE_OR = 8;     // |
Blockly.Rust.ORDER_RELATIONAL = 9;     // >= > <= < as is is!
Blockly.Rust.ORDER_EQUALITY = 10;      // == !=
Blockly.Rust.ORDER_LOGICAL_AND = 11;   // &&
Blockly.Rust.ORDER_LOGICAL_OR = 12;    // ||
Blockly.Rust.ORDER_IF_NULL = 13;       // ??
Blockly.Rust.ORDER_CONDITIONAL = 14;   // expr ? expr : expr
Blockly.Rust.ORDER_CASCADE = 15;       // ..
Blockly.Rust.ORDER_ASSIGNMENT = 16;    // = *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.Rust.ORDER_NONE = 99;          // (...)

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Rust.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Rust.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Rust.functionNames_ = Object.create(null);

  if (!Blockly.Rust.variableDB_) {
    Blockly.Rust.variableDB_ =
        new Blockly.Names(Blockly.Rust.RESERVED_WORDS_);
  } else {
    Blockly.Rust.variableDB_.reset();
  }

  Blockly.Rust.variableDB_.setVariableMap(workspace.getVariableMap());

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    defvars.push(Blockly.Rust.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars.push(Blockly.Rust.variableDB_.getName(variables[i].getId(),
        Blockly.Variables.NAME_TYPE));
  }

  // Declare all of the variables.
  if (defvars.length) {
    Blockly.Rust.definitions_['variables'] =
        '//  Globals: ' + defvars.join(', ') + ';';
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Rust.finish = function(code) {
  // var imports = [];
  var definitions = [];
  var globals = [];
  for (var name in Blockly.Rust.definitions_) {
    //  Each definition is either `use x` for import or `let x` for global variables.
    var def = Blockly.Rust.definitions_[name];
    if (def.match(/^use\s/)) {
      // imports.push(def);
    } else if (def.match(/^\/\/  Globals/)) {
      //  Put globals at the end.
      globals.push(def);
    } else {
      //  Other function definitions like `fn start_sensor_listener...`
      definitions.push(def);
    }
  }
  // Clean up temporary data.
  delete Blockly.Rust.definitions_;
  delete Blockly.Rust.functionNames_;
  Blockly.Rust.variableDB_.reset();
  // var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  // allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n'),
  return [
    rustHeader,
    code,                      //  on_start()
    definitions.join('\n\n'),  //  Custom Functions
    rustTrailer,               //  main()
    globals.join('\n'),        //  Globals
    '',
  ].join('\n');
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Rust.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped Rust string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Rust string.
 * @private
 */
Blockly.Rust.quote_ = function(string) {
  // Can't use goog.string.quote since $ must also be escaped.
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\$/g, '\\$')
                 .replace(/'/g, '\\\'');
  return '"' + string + '"';
};

/**
 * Common tasks for generating Rust from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Rust code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} Rust code with comments and subsequent blocks added.
 * @private
 */
Blockly.Rust.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    comment = Blockly.utils.wrap(comment, Blockly.Rust.COMMENT_WRAP - 3);
    if (comment) {
      if (block.getProcedureDef) {
        // Use documentation comment for function comments.
        commentCode += Blockly.Rust.prefixLines(comment + '\n', '/// ');
      } else {
        commentCode += Blockly.Rust.prefixLines(comment + '\n', '// ');
      }
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Rust.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Rust.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? '' : Blockly.Rust.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Blockly.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
Blockly.Rust.getAdjusted = function(block, atId, opt_delta, opt_negate,
    opt_order) {
  var delta = opt_delta || 0;
  var order = opt_order || Blockly.Rust.ORDER_NONE;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  if (delta) {
    var at = Blockly.Rust.valueToCode(block, atId,
        Blockly.Rust.ORDER_ADDITIVE) || defaultAtIndex;
  } else if (opt_negate) {
    var at = Blockly.Rust.valueToCode(block, atId,
        Blockly.Rust.ORDER_UNARY_PREFIX) || defaultAtIndex;
  } else {
    var at = Blockly.Rust.valueToCode(block, atId, order) ||
        defaultAtIndex;
  }

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = parseInt(at, 10) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      var innerOrder = Blockly.Rust.ORDER_ADDITIVE;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = Blockly.Rust.ORDER_ADDITIVE;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
      var innerOrder = Blockly.Rust.ORDER_UNARY_PREFIX;
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};

//  Header for the source file
var rustHeader = `//! This program was automatically generated by Visual Embedded Rust. Don't edit here!
#![no_std]                       //  Don't link with standard Rust library, which is not compatible with embedded systems
#![feature(trace_macros)]        //  Allow macro tracing: \`trace_macros!(true)\`
#![feature(concat_idents)]       //  Allow \`concat_idents!()\` macro used in \`coap!()\` macro
#![feature(const_transmute)]     //  Allow \`transmute\` for initialising Mynewt structs
#![feature(proc_macro_hygiene)]  //  Allow Procedural Macros like \`run!()\`
#![feature(custom_attribute)]    //  Allow Custom Attributes like \`#[safe_wrap]\`

extern crate cortex_m;                  //  Declare the external library \`cortex_m\`
extern crate mynewt;                    //  Declare the Mynewt library
extern crate macros as mynewt_macros;   //  Declare the Mynewt Procedural Macros library

use core::panic::PanicInfo; //  Import \`PanicInfo\` type which is used by \`panic()\` below
use core::ptr::null_mut;
use cortex_m::asm::bkpt;    //  Import cortex_m assembly function to inject breakpoint
use mynewt::{
    result::*,              //  Import Mynewt API Result and Error types
    kernel::os,             //  Import Mynewt OS API
    sys::console,           //  Import Mynewt Console API
    encoding::coap_context::*,  //  Import Mynewt Encoding API
    hw::sensor::{        
        self,               //  Import Mynewt Sensor API functions
        sensor_type_t,      //  Import Mynewt Sensor API types
        SensorValue, SensorValueType,
        SENSOR_TYPE_AMBIENT_TEMPERATURE_RAW,
    },
    libs::sensor_network,   //  Import Mynewt Sensor Network Library
    Strn, coap, d,          //  Import Mynewt macros    
};
use mynewt_macros::{ init_strn, strn };  //  Import Mynewt procedural macros
`;

//  Trailer for the source file
var rustTrailer = `
/// main() will be called at Mynewt startup. It replaces the C version of the \`main()\` function.
#[no_mangle]                 //  Don't mangle the name "main"
extern "C" fn main() -> ! {  //  Declare \`extern "C"\` because it will be called by Mynewt
    //  Initialise Mynewt OS
    mynewt::sysinit();

    //  Initialise the app
    on_start()
        .expect("on_start fail");

    //  Mynewt event loop
    loop {                         //  Loop forever...
        os::eventq_run(            //  Process events...
            os::eventq_dflt_get()  //  From default event queue
                .expect("get fail")
        ).expect("run fail")
    }
    //  Never comes here
}

/// This function is called on panic, like an assertion failure. We display the filename and line number and pause in the debugger. From https://os.phil-opp.com/freestanding-rust-binary/
#[panic_handler]
fn panic(info: &PanicInfo) -> ! {
    //  Display the filename and line number in the Semihosting Console
    console::print("panic ");
    if let Some(location) = info.location() {
        let file = location.file();
        let line = location.line();
        console::print("at ");       console::buffer(&file);
        console::print(" line 0x");  console::printhex(line as u8);  //  TODO: Print in decimal not hex. Allow more than 255 lines.
        console::print("\\n");       console::flush();
    } else {
        console::print("no loc\\n");  console::flush();
    }
    //  Pause in the debugger
    bkpt();
    //  Loop forever so that device won't restart
    loop {}
}

/// Use default COAP_URI from syscfg.yml
const DEFAULT_URI: &Strn = &init_strn!("");
`;