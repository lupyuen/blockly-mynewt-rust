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
 * @fileoverview Generating Rust for math blocks.
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

goog.provide('Blockly.Rust.math');

goog.require('Blockly.Rust');


Blockly.Rust.addReservedWords('Math');

Blockly.Rust['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  var order;
  if (code == Infinity) {
    code = 'double.infinity';
    order = Blockly.Rust.ORDER_UNARY_POSTFIX;
  } else if (code == -Infinity) {
    code = '-double.infinity';
    order = Blockly.Rust.ORDER_UNARY_PREFIX;
  } else {
    // -4.abs() returns -4 in Rust due to strange order of operation choices.
    // -4 is actually an operator and a number.  Reflect this in the order.
    order = code < 0 ?
        Blockly.Rust.ORDER_UNARY_PREFIX : Blockly.Rust.ORDER_ATOMIC;
  }
  return [code, order];
};

Blockly.Rust['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.Rust.ORDER_ADDITIVE],
    'MINUS': [' - ', Blockly.Rust.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Blockly.Rust.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Blockly.Rust.ORDER_MULTIPLICATIVE],
    'POWER': [null, Blockly.Rust.ORDER_NONE]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Rust.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Rust.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in Rust requires a special case since it has no operator.
  if (!operator) {
    Blockly.Rust.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Rust['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Rust.valueToCode(block, 'NUM',
        Blockly.Rust.ORDER_UNARY_PREFIX) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in Rust.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.Rust.ORDER_UNARY_PREFIX];
  }
  Blockly.Rust.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  if (operator == 'ABS' || operator.substring(0, 5) == 'ROUND') {
    arg = Blockly.Rust.valueToCode(block, 'NUM',
        Blockly.Rust.ORDER_UNARY_POSTFIX) || '0';
  } else if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.Rust.valueToCode(block, 'NUM',
        Blockly.Rust.ORDER_MULTIPLICATIVE) || '0';
  } else {
    arg = Blockly.Rust.valueToCode(block, 'NUM',
        Blockly.Rust.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = arg + '.abs()';
      break;
    case 'ROOT':
      code = 'Math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'Math.log(' + arg + ')';
      break;
    case 'EXP':
      code = 'Math.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'Math.pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = arg + '.round()';
      break;
    case 'ROUNDUP':
      code = arg + '.ceil()';
      break;
    case 'ROUNDDOWN':
      code = arg + '.floor()';
      break;
    case 'SIN':
      code = 'Math.sin(' + arg + ' / 180 * Math.pi)';
      break;
    case 'COS':
      code = 'Math.cos(' + arg + ' / 180 * Math.pi)';
      break;
    case 'TAN':
      code = 'Math.tan(' + arg + ' / 180 * Math.pi)';
      break;
  }
  if (code) {
    return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'Math.log(' + arg + ') / Math.log(10)';
      break;
    case 'ASIN':
      code = 'Math.asin(' + arg + ') / Math.pi * 180';
      break;
    case 'ACOS':
      code = 'Math.acos(' + arg + ') / Math.pi * 180';
      break;
    case 'ATAN':
      code = 'Math.atan(' + arg + ') / Math.pi * 180';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Blockly.Rust.ORDER_MULTIPLICATIVE];
};

Blockly.Rust['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['Math.pi', Blockly.Rust.ORDER_UNARY_POSTFIX],
    'E': ['Math.e', Blockly.Rust.ORDER_UNARY_POSTFIX],
    'GOLDEN_RATIO':
        ['(1 + Math.sqrt(5)) / 2', Blockly.Rust.ORDER_MULTIPLICATIVE],
    'SQRT2': ['Math.sqrt2', Blockly.Rust.ORDER_UNARY_POSTFIX],
    'SQRT1_2': ['Math.sqrt1_2', Blockly.Rust.ORDER_UNARY_POSTFIX],
    'INFINITY': ['double.infinity', Blockly.Rust.ORDER_ATOMIC]
  };
  var constant = block.getFieldValue('CONSTANT');
  if (constant != 'INFINITY') {
    Blockly.Rust.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
  }
  return CONSTANTS[constant];
};

Blockly.Rust['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Rust.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Rust.ORDER_MULTIPLICATIVE);
  if (!number_to_check) {
    return ['false', Blockly.Rust.ORDER_ATOMIC];
  }
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    Blockly.Rust.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
    var functionName = Blockly.Rust.provideFunction_(
        'math_isPrime',
        ['bool ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
         '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if (n == 2 || n == 3) {',
         '    return true;',
         '  }',
         '  // False if n is null, negative, is 1, or not whole.',
         '  // And false if n is divisible by 2 or 3.',
         '  if (n == null || n <= 1 || n % 1 != 0 || n % 2 == 0 ||' +
            ' n % 3 == 0) {',
         '    return false;',
         '  }',
         '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {',
         '    if (n % (x - 1) == 0 || n % (x + 1) == 0) {',
         '      return false;',
         '    }',
         '  }',
         '  return true;',
         '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.Rust.valueToCode(block, 'DIVISOR',
          Blockly.Rust.ORDER_MULTIPLICATIVE);
      if (!divisor) {
        return ['false', Blockly.Rust.ORDER_ATOMIC];
      }
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Rust.ORDER_EQUALITY];
};

Blockly.Rust['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Rust.valueToCode(block, 'DELTA',
      Blockly.Rust.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Rust.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return varName + ' = (' + varName + ' is num ? ' + varName + ' : 0) + ' +
      argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.Rust['math_round'] = Blockly.Rust['math_single'];
// Trigonometry functions have a single operand.
Blockly.Rust['math_trig'] = Blockly.Rust['math_single'];

Blockly.Rust['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list = Blockly.Rust.valueToCode(block, 'LIST',
      Blockly.Rust.ORDER_NONE) || '[]';
  var code;
  switch (func) {
    case 'SUM':
      var functionName = Blockly.Rust.provideFunction_(
          'math_sum',
          ['num ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List<num> myList) {',
           '  num sumVal = 0;',
           '  myList.forEach((num entry) {sumVal += entry;});',
           '  return sumVal;',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MIN':
      Blockly.Rust.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var functionName = Blockly.Rust.provideFunction_(
          'math_min',
          ['num ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List<num> myList) {',
           '  if (myList.isEmpty) return null;',
           '  num minVal = myList[0];',
           '  myList.forEach((num entry) ' +
              '{minVal = Math.min(minVal, entry);});',
           '  return minVal;',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MAX':
      Blockly.Rust.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var functionName = Blockly.Rust.provideFunction_(
          'math_max',
          ['num ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List<num> myList) {',
           '  if (myList.isEmpty) return null;',
           '  num maxVal = myList[0];',
           '  myList.forEach((num entry) ' +
              '{maxVal = Math.max(maxVal, entry);});',
           '  return maxVal;',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'AVERAGE':
      // This operation exclude null and values that are not int or float:
      //   math_mean([null,null,"aString",1,9]) == 5.0.
      var functionName = Blockly.Rust.provideFunction_(
          'math_mean',
          ['num ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
           '  // First filter list for numbers only.',
           '  List localList = new List.from(myList);',
           '  localList.removeWhere((a) => a is! num);',
           '  if (localList.isEmpty) return null;',
           '  num sumVal = 0;',
           '  localList.forEach((var entry) {sumVal += entry;});',
           '  return sumVal / localList.length;',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MEDIAN':
      var functionName = Blockly.Rust.provideFunction_(
          'math_median',
          ['num ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
           '  // First filter list for numbers only, then sort, ' +
              'then return middle value',
           '  // or the average of two middle values if list has an ' +
              'even number of elements.',
           '  List localList = new List.from(myList);',
           '  localList.removeWhere((a) => a is! num);',
           '  if (localList.isEmpty) return null;',
           '  localList.sort((a, b) => (a - b));',
           '  int index = localList.length ~/ 2;',
           '  if (localList.length % 2 == 1) {',
           '    return localList[index];',
           '  } else {',
           '    return (localList[index - 1] + localList[index]) / 2;',
           '  }',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      Blockly.Rust.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = Blockly.Rust.provideFunction_(
          'math_modes',
          ['List ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List values) {',
           '  List modes = [];',
           '  List counts = [];',
           '  int maxCount = 0;',
           '  for (int i = 0; i < values.length; i++) {',
           '    var value = values[i];',
           '    bool found = false;',
           '    int thisCount;',
           '    for (int j = 0; j < counts.length; j++) {',
           '      if (counts[j][0] == value) {',
           '        thisCount = ++counts[j][1];',
           '        found = true;',
           '        break;',
           '      }',
           '    }',
           '    if (!found) {',
           '      counts.add([value, 1]);',
           '      thisCount = 1;',
           '    }',
           '    maxCount = Math.max(thisCount, maxCount);',
           '  }',
           '  for (int j = 0; j < counts.length; j++) {',
           '    if (counts[j][1] == maxCount) {',
           '        modes.add(counts[j][0]);',
           '    }',
           '  }',
           '  return modes;',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      Blockly.Rust.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var functionName = Blockly.Rust.provideFunction_(
          'math_standard_deviation',
          ['num ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
           '  // First filter list for numbers only.',
           '  List numbers = new List.from(myList);',
           '  numbers.removeWhere((a) => a is! num);',
           '  if (numbers.isEmpty) return null;',
           '  num n = numbers.length;',
           '  num sum = 0;',
           '  numbers.forEach((x) => sum += x);',
           '  num mean = sum / n;',
           '  num sumSquare = 0;',
           '  numbers.forEach((x) => sumSquare += ' +
              'Math.pow(x - mean, 2));',
           '  return Math.sqrt(sumSquare / n);',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    case 'RANDOM':
      Blockly.Rust.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var functionName = Blockly.Rust.provideFunction_(
          'math_random_item',
          ['dynamic ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List myList) {',
           '  int x = new Math.Random().nextInt(myList.length);',
           '  return myList[x];',
           '}']);
      code = functionName + '(' + list + ')';
      break;
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Rust.valueToCode(block, 'DIVIDEND',
      Blockly.Rust.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.Rust.valueToCode(block, 'DIVISOR',
      Blockly.Rust.ORDER_MULTIPLICATIVE) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Rust.ORDER_MULTIPLICATIVE];
};

Blockly.Rust['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  Blockly.Rust.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var argument0 = Blockly.Rust.valueToCode(block, 'VALUE',
      Blockly.Rust.ORDER_NONE) || '0';
  var argument1 = Blockly.Rust.valueToCode(block, 'LOW',
      Blockly.Rust.ORDER_NONE) || '0';
  var argument2 = Blockly.Rust.valueToCode(block, 'HIGH',
      Blockly.Rust.ORDER_NONE) || 'double.infinity';
  var code = 'Math.min(Math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  Blockly.Rust.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var argument0 = Blockly.Rust.valueToCode(block, 'FROM',
      Blockly.Rust.ORDER_NONE) || '0';
  var argument1 = Blockly.Rust.valueToCode(block, 'TO',
      Blockly.Rust.ORDER_NONE) || '0';
  var functionName = Blockly.Rust.provideFunction_(
      'math_random_int',
      ['int ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ + '(num a, num b) {',
       '  if (a > b) {',
       '    // Swap a and b to ensure a is smaller.',
       '    num c = a;',
       '    a = b;',
       '    b = c;',
       '  }',
       '  return new Math.Random().nextInt(b - a + 1) + a;',
       '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  Blockly.Rust.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  return ['new Math.Random().nextDouble()', Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  Blockly.Rust.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var argument0 = Blockly.Rust.valueToCode(block, 'X',
      Blockly.Rust.ORDER_NONE) || '0';
  var argument1 = Blockly.Rust.valueToCode(block, 'Y',
      Blockly.Rust.ORDER_NONE) || '0';
  return ['Math.atan2(' + argument1 + ', ' + argument0 + ') / Math.pi * 180',
      Blockly.Rust.ORDER_MULTIPLICATIVE];
};
