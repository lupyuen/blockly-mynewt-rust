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
 * @fileoverview Generating Rust for colour blocks.
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

goog.provide('Blockly.Rust.colour');

goog.require('Blockly.Rust');


Blockly.Rust.addReservedWords('Math');

Blockly.Rust['colour_picker'] = function(block) {
  // Colour picker.
  var code = '\'' + block.getFieldValue('COLOUR') + '\'';
  return [code, Blockly.Rust.ORDER_ATOMIC];
};

Blockly.Rust['colour_random'] = function(block) {
  // Generate a random colour.
  Blockly.Rust.definitions_['use_dart_math'] =
      'use \'dart:math\' as Math;';
  var functionName = Blockly.Rust.provideFunction_(
      'colour_random',
      ['String ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ + '() {',
       '  String hex = \'0123456789abcdef\';',
       '  var rnd = new Math.Random();',
       '  return \'#${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\'',
       '      \'${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\'',
       '      \'${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\';',
       '}']);
  var code = functionName + '()';
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = Blockly.Rust.valueToCode(block, 'RED',
      Blockly.Rust.ORDER_NONE) || 0;
  var green = Blockly.Rust.valueToCode(block, 'GREEN',
      Blockly.Rust.ORDER_NONE) || 0;
  var blue = Blockly.Rust.valueToCode(block, 'BLUE',
      Blockly.Rust.ORDER_NONE) || 0;

  Blockly.Rust.definitions_['use_dart_math'] =
      'use \'dart:math\' as Math;';
  var functionName = Blockly.Rust.provideFunction_(
      'colour_rgb',
      ['String ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
          '(num r, num g, num b) {',
       '  num rn = (Math.max(Math.min(r, 100), 0) * 2.55).round();',
       '  String rs = rn.toInt().toRadixString(16);',
       '  rs = \'0$rs\';',
       '  rs = rs.substring(rs.length - 2);',
       '  num gn = (Math.max(Math.min(g, 100), 0) * 2.55).round();',
       '  String gs = gn.toInt().toRadixString(16);',
       '  gs = \'0$gs\';',
       '  gs = gs.substring(gs.length - 2);',
       '  num bn = (Math.max(Math.min(b, 100), 0) * 2.55).round();',
       '  String bs = bn.toInt().toRadixString(16);',
       '  bs = \'0$bs\';',
       '  bs = bs.substring(bs.length - 2);',
       '  return \'#$rs$gs$bs\';',
       '}']);
  var code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = Blockly.Rust.valueToCode(block, 'COLOUR1',
      Blockly.Rust.ORDER_NONE) || '\'#000000\'';
  var c2 = Blockly.Rust.valueToCode(block, 'COLOUR2',
      Blockly.Rust.ORDER_NONE) || '\'#000000\'';
  var ratio = Blockly.Rust.valueToCode(block, 'RATIO',
      Blockly.Rust.ORDER_NONE) || 0.5;

  Blockly.Rust.definitions_['use_dart_math'] =
      'use \'dart:math\' as Math;';
  var functionName = Blockly.Rust.provideFunction_(
      'colour_blend',
      ['String ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
          '(String c1, String c2, num ratio) {',
       '  ratio = Math.max(Math.min(ratio, 1), 0);',
       '  int r1 = int.parse(\'0x${c1.substring(1, 3)}\');',
       '  int g1 = int.parse(\'0x${c1.substring(3, 5)}\');',
       '  int b1 = int.parse(\'0x${c1.substring(5, 7)}\');',
       '  int r2 = int.parse(\'0x${c2.substring(1, 3)}\');',
       '  int g2 = int.parse(\'0x${c2.substring(3, 5)}\');',
       '  int b2 = int.parse(\'0x${c2.substring(5, 7)}\');',
       '  num rn = (r1 * (1 - ratio) + r2 * ratio).round();',
       '  String rs = rn.toInt().toRadixString(16);',
       '  num gn = (g1 * (1 - ratio) + g2 * ratio).round();',
       '  String gs = gn.toInt().toRadixString(16);',
       '  num bn = (b1 * (1 - ratio) + b2 * ratio).round();',
       '  String bs = bn.toInt().toRadixString(16);',
       '  rs = \'0$rs\';',
       '  rs = rs.substring(rs.length - 2);',
       '  gs = \'0$gs\';',
       '  gs = gs.substring(gs.length - 2);',
       '  bs = \'0$bs\';',
       '  bs = bs.substring(bs.length - 2);',
       '  return \'#$rs$gs$bs\';',
       '}']);
  var code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};
