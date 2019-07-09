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
 * @fileoverview Generating Rust for list blocks.
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

goog.provide('Blockly.Rust.lists');

goog.require('Blockly.Rust');


Blockly.Rust.addReservedWords('Math');

Blockly.Rust['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['[]', Blockly.Rust.ORDER_ATOMIC];
};

Blockly.Rust['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Rust.valueToCode(block, 'ADD' + i,
        Blockly.Rust.ORDER_NONE) || 'null';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, Blockly.Rust.ORDER_ATOMIC];
};

Blockly.Rust['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var element = Blockly.Rust.valueToCode(block, 'ITEM',
      Blockly.Rust.ORDER_NONE) || 'null';
  var repeatCount = Blockly.Rust.valueToCode(block, 'NUM',
      Blockly.Rust.ORDER_NONE) || '0';
  var code = 'new List.filled(' + repeatCount + ', ' + element + ')';
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['lists_length'] = function(block) {
  // String or array length.
  var list = Blockly.Rust.valueToCode(block, 'VALUE',
      Blockly.Rust.ORDER_UNARY_POSTFIX) || '[]';
  return [list + '.length', Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var list = Blockly.Rust.valueToCode(block, 'VALUE',
      Blockly.Rust.ORDER_UNARY_POSTFIX) || '[]';
  return [list + '.isEmpty', Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var item = Blockly.Rust.valueToCode(block, 'FIND',
      Blockly.Rust.ORDER_NONE) || '\'\'';
  var list = Blockly.Rust.valueToCode(block, 'VALUE',
      Blockly.Rust.ORDER_UNARY_POSTFIX) || '[]';
  var code = list + '.' + operator + '(' + item + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Blockly.Rust.ORDER_ADDITIVE];
  }
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var listOrder = (where == 'RANDOM' || where == 'FROM_END') ?
      Blockly.Rust.ORDER_NONE : Blockly.Rust.ORDER_UNARY_POSTFIX;
  var list = Blockly.Rust.valueToCode(block, 'VALUE', listOrder) || '[]';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    var listVar = Blockly.Rust.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    var code = 'List ' + listVar + ' = ' + list + ';\n';
    list = listVar;
    return code;
  }
  // If `list` would be evaluated more than once (which is the case for
  // RANDOM REMOVE and FROM_END) and is non-trivial, make sure to access it
  // only once.
  if (((where == 'RANDOM' && mode == 'REMOVE') || where == 'FROM_END') &&
      !list.match(/^\w+$/)) {
    // `list` is an expression, so we may not evaluate it more than once.
    if (where == 'RANDOM') {
      Blockly.Rust.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      // We can use multiple statements.
      var code = cacheList();
      var xVar = Blockly.Rust.variableDB_.getDistinctName(
          'tmp_x', Blockly.Variables.NAME_TYPE);
      code += 'int ' + xVar + ' = new Math.Random().nextInt(' + list +
          '.length);\n';
      code += list + '.removeAt(' + xVar + ');\n';
      return code;
    } else {  // where == 'FROM_END'
      if (mode == 'REMOVE') {
        // We can use multiple statements.
        var at = Blockly.Rust.getAdjusted(block, 'AT', 1, false,
            Blockly.Rust.ORDER_ADDITIVE);
        var code = cacheList();
        code += list + '.removeAt(' + list + '.length' + ' - ' + at + ');\n';
        return code;

      } else if (mode == 'GET') {
        var at = Blockly.Rust.getAdjusted(block, 'AT', 1);
        // We need to create a procedure to avoid reevaluating values.
        var functionName = Blockly.Rust.provideFunction_(
            'lists_get_from_end',
            ['dynamic ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
            '(List my_list, num x) {',
              '  x = my_list.length - x;',
              '  return my_list[x];',
              '}']);
        var code = functionName + '(' + list + ', ' + at + ')';
        return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
      } else if (mode == 'GET_REMOVE') {
        var at = Blockly.Rust.getAdjusted(block, 'AT', 1);
        // We need to create a procedure to avoid reevaluating values.
        var functionName = Blockly.Rust.provideFunction_(
            'lists_remove_from_end',
            ['dynamic ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
            '(List my_list, num x) {',
              '  x = my_list.length - x;',
              '  return my_list.removeAt(x);',
              '}']);
        var code = functionName + '(' + list + ', ' + at + ')';
        return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
      }
    }
  } else {
    // Either `list` is a simple variable, or we only need to refer to `list`
    // once.
    switch (where) {
      case 'FIRST':
        if (mode == 'GET') {
          var code = list + '.first';
          return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
        } else if (mode == 'GET_REMOVE') {
          var code = list + '.removeAt(0)';
          return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
        } else if (mode == 'REMOVE') {
          return list + '.removeAt(0);\n';
        }
        break;
      case 'LAST':
        if (mode == 'GET') {
          var code = list + '.last';
          return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
        } else if (mode == 'GET_REMOVE') {
          var code = list + '.removeLast()';
          return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
        } else if (mode == 'REMOVE') {
          return list + '.removeLast();\n';
        }
        break;
      case 'FROM_START':
        var at = Blockly.Rust.getAdjusted(block, 'AT');
        if (mode == 'GET') {
          var code = list + '[' + at + ']';
          return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
        } else if (mode == 'GET_REMOVE') {
          var code = list + '.removeAt(' + at + ')';
          return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
        } else if (mode == 'REMOVE') {
          return list + '.removeAt(' + at + ');\n';
        }
        break;
      case 'FROM_END':
        var at = Blockly.Rust.getAdjusted(block, 'AT', 1, false,
            Blockly.Rust.ORDER_ADDITIVE);
        if (mode == 'GET') {
          var code = list + '[' + list + '.length - ' + at + ']';
          return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
        } else if (mode == 'GET_REMOVE' || mode == 'REMOVE') {
          var code = list + '.removeAt(' + list + '.length - ' + at + ')';
          if (mode == 'GET_REMOVE') {
            return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
          } else if (mode == 'REMOVE') {
            return code + ';\n';
          }
        }
        break;
      case 'RANDOM':
        Blockly.Rust.definitions_['import_dart_math'] =
            'import \'dart:math\' as Math;';
        if (mode == 'REMOVE') {
          // We can use multiple statements.
          var xVar = Blockly.Rust.variableDB_.getDistinctName(
              'tmp_x', Blockly.Variables.NAME_TYPE);
          var code = 'int ' + xVar + ' = new Math.Random().nextInt(' + list +
              '.length);\n';
          code += list + '.removeAt(' + xVar + ');\n';
          return code;
        } else if (mode == 'GET') {
          var functionName = Blockly.Rust.provideFunction_(
              'lists_get_random_item',
              ['dynamic ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List my_list) {',
                '  int x = new Math.Random().nextInt(my_list.length);',
                '  return my_list[x];',
                '}']);
          var code = functionName + '(' + list + ')';
          return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
        } else if (mode == 'GET_REMOVE') {
          var functionName = Blockly.Rust.provideFunction_(
              'lists_remove_random_item',
              ['dynamic ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
              '(List my_list) {',
                '  int x = new Math.Random().nextInt(my_list.length);',
                '  return my_list.removeAt(x);',
                '}']);
          var code = functionName + '(' + list + ')';
          return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
        }
        break;
    }
  }
  throw Error('Unhandled combination (lists_getIndex).');
};

Blockly.Rust['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var list = Blockly.Rust.valueToCode(block, 'LIST',
      Blockly.Rust.ORDER_UNARY_POSTFIX) || '[]';
  var value = Blockly.Rust.valueToCode(block, 'TO',
      Blockly.Rust.ORDER_ASSIGNMENT) || 'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.Rust.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    var code = 'List ' + listVar + ' = ' + list + ';\n';
    list = listVar;
    return code;
  }
  switch (where) {
    case 'FIRST':
      if (mode == 'SET') {
        return list + '[0] = ' + value + ';\n';
      } else if (mode == 'INSERT') {
        return list + '.insert(0, ' + value + ');\n';
      }
      break;
    case 'LAST':
      if (mode == 'SET') {
        var code = cacheList();
        code += list + '[' + list + '.length - 1] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        return list + '.add(' + value + ');\n';
      }
      break;
    case 'FROM_START':
      var at = Blockly.Rust.getAdjusted(block, 'AT');
      if (mode == 'SET') {
        return list + '[' + at + '] = ' + value + ';\n';
      } else if (mode == 'INSERT') {
        return list + '.insert(' + at + ', ' + value + ');\n';
      }
      break;
    case 'FROM_END':
      var at = Blockly.Rust.getAdjusted(block, 'AT', 1, false,
          Blockly.Rust.ORDER_ADDITIVE);
      var code = cacheList();
      if (mode == 'SET') {
        code += list + '[' + list + '.length - ' + at + '] = ' + value +
            ';\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.insert(' + list + '.length - ' + at + ', ' +
            value + ');\n';
        return code;
      }
      break;
    case 'RANDOM':
      Blockly.Rust.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var code = cacheList();
      var xVar = Blockly.Rust.variableDB_.getDistinctName(
          'tmp_x', Blockly.Variables.NAME_TYPE);
      code += 'int ' + xVar +
          ' = new Math.Random().nextInt(' + list + '.length);\n';
      if (mode == 'SET') {
        code += list + '[' + xVar + '] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.insert(' + xVar + ', ' + value + ');\n';
        return code;
      }
      break;
  }
  throw Error('Unhandled combination (lists_setIndex).');
};

Blockly.Rust['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Rust.valueToCode(block, 'LIST',
      Blockly.Rust.ORDER_UNARY_POSTFIX) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (list.match(/^\w+$/) || (where1 != 'FROM_END' && where2 == 'FROM_START')) {
    // If the list is a is a variable or doesn't require a call for length,
    // don't generate a helper function.
    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.Rust.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.Rust.getAdjusted(block, 'AT1', 1, false,
            Blockly.Rust.ORDER_ADDITIVE);
        at1 = list + '.length - ' + at1;
        break;
      case 'FIRST':
        var at1 = '0';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    switch (where2) {
      case 'FROM_START':
        var at2 = Blockly.Rust.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        var at2 = Blockly.Rust.getAdjusted(block, 'AT2', 0, false,
            Blockly.Rust.ORDER_ADDITIVE);
        at2 = list + '.length - ' + at2;
        break;
      case 'LAST':
        // There is no second index if LAST option is chosen.
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    if (where2 == 'LAST') {
      var code = list + '.sublist(' + at1 + ')';
    } else {
      var code = list + '.sublist(' + at1 + ', ' + at2 + ')';
    }
  } else {
    var at1 = Blockly.Rust.getAdjusted(block, 'AT1');
    var at2 = Blockly.Rust.getAdjusted(block, 'AT2');
    var functionName = Blockly.Rust.provideFunction_(
        'lists_get_sublist',
        ['List ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
            '(List list, String where1, num at1, String where2, num at2) {',
         '  int getAt(String where, num at) {',
         '    if (where == \'FROM_END\') {',
         '      at = list.length - 1 - at;',
         '    } else if (where == \'FIRST\') {',
         '      at = 0;',
         '    } else if (where == \'LAST\') {',
         '      at = list.length - 1;',
         '    } else if (where != \'FROM_START\') {',
         '      throw \'Unhandled option (lists_getSublist).\';',
         '    }',
         '    return at;',
         '  }',
         '  at1 = getAt(where1, at1);',
         '  at2 = getAt(where2, at2) + 1;',
         '  return list.sublist(at1, at2);',
         '}']);
    var code = functionName + '(' + list + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
  }
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['lists_sort'] = function(block) {
  // Block for sorting a list.
  var list = Blockly.Rust.valueToCode(block, 'LIST',
      Blockly.Rust.ORDER_NONE) || '[]';
  var direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  var type = block.getFieldValue('TYPE');
  var sortFunctionName = Blockly.Rust.provideFunction_(
      'lists_sort',
      ['List ' + Blockly.Rust.FUNCTION_NAME_PLACEHOLDER_ +
          '(List list, String type, int direction) {',
       '  var compareFuncs = {',
       '    "NUMERIC": (a, b) => (direction * a.compareTo(b)).toInt(),',
       '    "TEXT": (a, b) => direction * ' +
          'a.toString().compareTo(b.toString()),',
       '    "IGNORE_CASE": ',
       '       (a, b) => direction * ',
       '      a.toString().toLowerCase().compareTo(b.toString().toLowerCase())',
       '  };',
       '  list = new List.from(list);', // Clone the list.
       '  var compare = compareFuncs[type];',
       '  list.sort(compare);',
       '  return list;',
       '}']);
  return [sortFunctionName + '(' + list + ', ' +
      '"' + type + '", ' + direction + ')',
      Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var input = Blockly.Rust.valueToCode(block, 'INPUT',
      Blockly.Rust.ORDER_UNARY_POSTFIX);
  var delimiter = Blockly.Rust.valueToCode(block, 'DELIM',
      Blockly.Rust.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    if (!input) {
      input = '\'\'';
    }
    var functionName = 'split';
  } else if (mode == 'JOIN') {
    if (!input) {
      input = '[]';
    }
    var functionName = 'join';
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  var code = input + '.' + functionName + '(' + delimiter + ')';
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['lists_reverse'] = function(block) {
  // Block for reversing a list.
  var list = Blockly.Rust.valueToCode(block, 'LIST',
      Blockly.Rust.ORDER_NONE) || '[]';
  // XXX What should the operator precedence be for a `new`?
  var code = 'new List.from(' + list + '.reversed)';
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};
