/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Utility functions for handling widgets.
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

/**
 * @name Blockly.Widgets
 * @namespace
 */
goog.provide('Blockly.Widgets');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Widgets.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('Blockly.Xml.utils');


/**
 * Constant to separate widget names from variables and generated functions
 * when running generators.
 * @deprecated Use Blockly.WIDGET_CATEGORY_NAME
 */
Blockly.Widgets.NAME_TYPE = Blockly.WIDGET_CATEGORY_NAME;

/**
 * Find all user-created widget definitions in a workspace.
 * @param {!Blockly.Workspace} root Root workspace.
 * @return {!Array.<!Array.<!Array>>} Pair of arrays, the
 *     first contains widgets without return variables, the second with.
 *     Each widget is defined by a three-element list of name, parameter
 *     list, and return value boolean.
 */
Blockly.Widgets.allWidgets = function(root) {
  var blocks = root.getAllBlocks(false);
  var widgetsReturn = [];
  var widgetsNoReturn = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getWidgetDef) {
      var tuple = blocks[i].getWidgetDef();
      if (tuple) {
        if (tuple[2]) {
          widgetsReturn.push(tuple);
        } else {
          widgetsNoReturn.push(tuple);
        }
      }
    }
  }
  widgetsNoReturn.sort(Blockly.Widgets.procTupleComparator_);
  widgetsReturn.sort(Blockly.Widgets.procTupleComparator_);
  return [widgetsNoReturn, widgetsReturn];
};

/**
 * Comparison function for case-insensitive sorting of the first element of
 * a tuple.
 * @param {!Array} ta First tuple.
 * @param {!Array} tb Second tuple.
 * @return {number} -1, 0, or 1 to signify greater than, equality, or less than.
 * @private
 */
Blockly.Widgets.procTupleComparator_ = function(ta, tb) {
  return ta[0].toLowerCase().localeCompare(tb[0].toLowerCase());
};

/**
 * Ensure two identically-named widgets don't exist.
 * @param {string} name Proposed widget name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Widgets.findLegalName = function(name, block) {
  if (block.isInFlyout) {
    // Flyouts can have multiple widgets called 'do something'.
    return name;
  }
  while (!Blockly.Widgets.isLegalName_(name, block.workspace, block)) {
    // Collision with another widget.
    var r = name.match(/^(.*?)(\d+)$/);
    if (!r) {
      name += '2';
    } else {
      name = r[1] + (parseInt(r[2], 10) + 1);
    }
  }
  return name;
};

/**
 * Does this widget have a legal name?  Illegal names include names of
 * widgets already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 * @private
 */
Blockly.Widgets.isLegalName_ = function(name, workspace, opt_exclude) {
  return !Blockly.Widgets.isNameUsed(name, workspace, opt_exclude);
};

/**
 * Return if the given name is already a widget name.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is used, otherwise return false.
 */
Blockly.Widgets.isNameUsed = function(name, workspace, opt_exclude) {
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i] == opt_exclude) {
      continue;
    }
    if (blocks[i].getWidgetDef) {
      var procName = blocks[i].getWidgetDef();
      if (Blockly.Names.equals(procName[0], name)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Rename a widget.  Called by the editable field.
 * @param {string} name The proposed new name.
 * @return {string} The accepted name.
 * @this {Blockly.Field}
 */
Blockly.Widgets.rename = function(name) {
  // Strip leading and trailing whitespace.  Beyond this, all names are legal.
  name = name.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');

  // Ensure two identically-named widgets don't exist.
  var legalName = Blockly.Widgets.findLegalName(name, this.sourceBlock_);
  var oldName = this.text_;
  if (oldName != name && oldName != legalName) {
    // Rename any callers.
    var blocks = this.sourceBlock_.workspace.getAllBlocks(false);
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].renameWidget) {
        blocks[i].renameWidget(oldName, legalName);
      }
    }
  }
  return legalName;
};

/**
 * Construct the blocks required by the flyout for the widget category.
 * @param {!Blockly.Workspace} workspace The workspace containing widgets.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Widgets.flyoutCategory = function(workspace) {
  var xmlList = [];
  if (Blockly.Blocks['widgets_defnoreturn']) {
    // <block type="widgets_defnoreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    var block = Blockly.Xml.utils.createElement('block');
    block.setAttribute('type', 'widgets_defnoreturn');
    block.setAttribute('gap', 16);
    var nameField = Blockly.Xml.utils.createElement('field');
    nameField.setAttribute('name', 'NAME');
    nameField.appendChild(Blockly.Xml.utils.createTextNode(
        Blockly.Msg['WIDGETS_DEFNORETURN_WIDGET']));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks['widgets_defreturn']) {
    // <block type="widgets_defreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    var block = Blockly.Xml.utils.createElement('block');
    block.setAttribute('type', 'widgets_defreturn');
    block.setAttribute('gap', 16);
    var nameField = Blockly.Xml.utils.createElement('field');
    nameField.setAttribute('name', 'NAME');
    nameField.appendChild(Blockly.Xml.utils.createTextNode(
        Blockly.Msg['WIDGETS_DEFRETURN_WIDGET']));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks['widgets_ifreturn']) {
    // <block type="widgets_ifreturn" gap="16"></block>
    var block = Blockly.Xml.utils.createElement('block');
    block.setAttribute('type', 'widgets_ifreturn');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  if (xmlList.length) {
    // Add slightly larger gap between system blocks and user calls.
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
  }

  function populateWidgets(widgetList, templateName) {
    for (var i = 0; i < widgetList.length; i++) {
      var name = widgetList[i][0];
      var args = widgetList[i][1];
      // <block type="widgets_callnoreturn" gap="16">
      //   <mutation name="do something">
      //     <arg name="x"></arg>
      //   </mutation>
      // </block>
      var block = Blockly.Xml.utils.createElement('block');
      block.setAttribute('type', templateName);
      block.setAttribute('gap', 16);
      var mutation = Blockly.Xml.utils.createElement('mutation');
      mutation.setAttribute('name', name);
      block.appendChild(mutation);
      for (var j = 0; j < args.length; j++) {
        var arg = Blockly.Xml.utils.createElement('arg');
        arg.setAttribute('name', args[j]);
        mutation.appendChild(arg);
      }
      xmlList.push(block);
    }
  }

  var tuple = Blockly.Widgets.allWidgets(workspace);
  populateWidgets(tuple[0], 'widgets_callnoreturn');
  populateWidgets(tuple[1], 'widgets_callreturn');
  return xmlList;
};

/**
 * Find all the callers of a named widget.
 * @param {string} name Name of widget.
 * @param {!Blockly.Workspace} workspace The workspace to find callers in.
 * @return {!Array.<!Blockly.Block>} Array of caller blocks.
 */
Blockly.Widgets.getCallers = function(name, workspace) {
  var callers = [];
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getWidgetCall) {
      var procName = blocks[i].getWidgetCall();
      // Widget name may be null if the block is only half-built.
      if (procName && Blockly.Names.equals(procName, name)) {
        callers.push(blocks[i]);
      }
    }
  }
  return callers;
};

/**
 * When a widget definition changes its parameters, find and edit all its
 * callers.
 * @param {!Blockly.Block} defBlock Widget definition block.
 */
Blockly.Widgets.mutateCallers = function(defBlock) {
  var oldRecordUndo = Blockly.Widgets.recordUndo;
  var name = defBlock.getWidgetDef()[0];
  var xmlElement = defBlock.mutationToDom(true);
  var callers = Blockly.Widgets.getCallers(name, defBlock.workspace);
  for (var i = 0, caller; caller = callers[i]; i++) {
    var oldMutationDom = caller.mutationToDom();
    var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
    caller.domToMutation(xmlElement);
    var newMutationDom = caller.mutationToDom();
    var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
    if (oldMutation != newMutation) {
      // Fire a mutation on every caller block.  But don't record this as an
      // undo action since it is deterministically tied to the widget's
      // definition mutation.
      Blockly.Widgets.recordUndo = false;
      Blockly.Widgets.fire(new Blockly.Widgets.BlockChange(
          caller, 'mutation', null, oldMutation, newMutation));
      Blockly.Widgets.recordUndo = oldRecordUndo;
    }
  }
};

/**
 * Find the definition block for the named widget.
 * @param {string} name Name of widget.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {Blockly.Block} The widget definition block, or null not found.
 */
Blockly.Widgets.getDefinition = function(name, workspace) {
  // Assume that a widget definition is a top block.
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getWidgetDef) {
      var tuple = blocks[i].getWidgetDef();
      if (tuple && Blockly.Names.equals(tuple[0], name)) {
        return blocks[i];
      }
    }
  }
  return null;
};
