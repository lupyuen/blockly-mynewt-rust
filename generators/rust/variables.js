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
 * @fileoverview Generating Rust for variable blocks.
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

goog.provide('Blockly.Rust.variables');

goog.require('Blockly.Rust');


Blockly.Rust['variables_get'] = function(block) {
  // Variable getter.
  var code = Blockly.Rust.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return [code, Blockly.Rust.ORDER_ATOMIC];
};

Blockly.Rust['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.Rust.valueToCode(block, 'VALUE',
      Blockly.Rust.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.Rust.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  //  For strings, change "s" to strn!("s").
  if (argument0[0] === '"') {
    argument0 = [
      'strn!( ',
      argument0,
      ' )'
    ].join('');
  }
  return 'let ' + varName + ' = ' + argument0 + ';\n';
};