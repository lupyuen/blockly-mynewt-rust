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
 * @fileoverview Generating Rust for procedure blocks.
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

goog.provide('Blockly.Rust.procedures');

goog.require('Blockly.Rust');


Blockly.Rust['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Rust.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Rust.statementToCode(block, 'STACK');
  if (Blockly.Rust.STATEMENT_PREFIX) {
    var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
    branch = Blockly.Rust.prefixLines(
        Blockly.Rust.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + id + '\''), Blockly.Rust.INDENT) + branch;
  }
  if (Blockly.Rust.INFINITE_LOOP_TRAP) {
    branch = Blockly.Rust.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.Rust.valueToCode(block, 'RETURN',
      Blockly.Rust.ORDER_NONE) || '';
  var returnType = returnValue ? 'dynamic' : 'void';
  returnValue = Blockly.Rust.INDENT + 'Ok(' + (returnValue || '()') + ')\n';
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    //  Assemble the args and give them placeholder types: `arg1: _`
    args[i] = Blockly.Rust.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE) + ': _';
  }
  funcName = funcName.split('__').join('::');  //  TODO: Convert sensor__func to sensor::func
  var code;
  if (funcName.indexOf('::') >= 0) {
    //  System function: Do nothing
    code = '//  Import ' + funcName;
  } else {
    //  User-defined function: Define the function
    code = [
      //  Set the `infer_type` attribute so that the `infer_type` macro will infer the placeholder types.
      '#[mynewt_macros::infer_type(attr)]  //  Infer the missing types\n',
      'fn ', funcName,
      '(', 
        args.join(', '),
      ') ',
      '-> MynewtResult<', 
      returnType == 'void' ? '()' : returnType, 
      '> ',
      '{\n',
      branch,
      returnValue,
      '}'
    ].join('');  
  }
  // console.log(['code', funcName, code]); ////
  code = Blockly.Rust.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Rust.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Rust['procedures_defnoreturn'] = Blockly.Rust['procedures_defreturn'];

Blockly.Rust['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Rust.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Rust.valueToCode(block, 'ARG' + i,
        Blockly.Rust.ORDER_NONE) || 'null';
  }
  funcName = funcName.split('__').join('::');  //  TODO: Convert sensor__func to sensor::func
  var code = funcName + '(' + args.join(', ') + ') ? ';
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Rust.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Rust.valueToCode(block, 'ARG' + i,
        Blockly.Rust.ORDER_NONE) || 'null';
  }
  funcName = funcName.split('__').join('::');  //  TODO: Convert sensor__func to sensor::func
  var code = funcName + '(' + args.join(', ') + ') ? ;\n';
  return code;
};

Blockly.Rust['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Rust.valueToCode(block, 'CONDITION',
      Blockly.Rust.ORDER_NONE) || 'false';
  var code = 'if ' + condition + ' {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Rust.valueToCode(block, 'VALUE',
        Blockly.Rust.ORDER_NONE) || 'null';
    code += Blockly.Rust.INDENT + 'return ' + value + ';\n';
  } else {
    code += Blockly.Rust.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
