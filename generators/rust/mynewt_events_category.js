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
 * @fileoverview Utility functions for handling events.
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

/**
 * @name Blockly.Events
 * @namespace
 */
goog.provide('Blockly.Events');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('Blockly.Xml.utils');


/**
 * Constant to separate event names from variables and generated functions
 * when running generators.
 * @deprecated Use Blockly.EVENT_CATEGORY_NAME
 */
Blockly.Events.NAME_TYPE = Blockly.EVENT_CATEGORY_NAME;

/**
 * Find all user-created event definitions in a workspace.
 * @param {!Blockly.Workspace} root Root workspace.
 * @return {!Array.<!Array.<!Array>>} Pair of arrays, the
 *     first contains events without return variables, the second with.
 *     Each event is defined by a three-element list of name, parameter
 *     list, and return value boolean.
 */
Blockly.Events.allEvents = function(root) {
  var blocks = root.getAllBlocks(false);
  var eventsReturn = [];
  var eventsNoReturn = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getEventDef) {
      var tuple = blocks[i].getEventDef();
      if (tuple) {
        if (tuple[2]) {
          eventsReturn.push(tuple);
        } else {
          eventsNoReturn.push(tuple);
        }
      }
    }
  }
  eventsNoReturn.sort(Blockly.Events.procTupleComparator_);
  eventsReturn.sort(Blockly.Events.procTupleComparator_);
  return [eventsNoReturn, eventsReturn];
};

/**
 * Comparison function for case-insensitive sorting of the first element of
 * a tuple.
 * @param {!Array} ta First tuple.
 * @param {!Array} tb Second tuple.
 * @return {number} -1, 0, or 1 to signify greater than, equality, or less than.
 * @private
 */
Blockly.Events.procTupleComparator_ = function(ta, tb) {
  return ta[0].toLowerCase().localeCompare(tb[0].toLowerCase());
};

/**
 * Ensure two identically-named events don't exist.
 * @param {string} name Proposed event name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Events.findLegalName = function(name, block) {
  if (block.isInFlyout) {
    // Flyouts can have multiple events called 'do something'.
    return name;
  }
  while (!Blockly.Events.isLegalName_(name, block.workspace, block)) {
    // Collision with another event.
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
 * Does this event have a legal name?  Illegal names include names of
 * events already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 * @private
 */
Blockly.Events.isLegalName_ = function(name, workspace, opt_exclude) {
  return !Blockly.Events.isNameUsed(name, workspace, opt_exclude);
};

/**
 * Return if the given name is already a event name.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is used, otherwise return false.
 */
Blockly.Events.isNameUsed = function(name, workspace, opt_exclude) {
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i] == opt_exclude) {
      continue;
    }
    if (blocks[i].getEventDef) {
      var procName = blocks[i].getEventDef();
      if (Blockly.Names.equals(procName[0], name)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Rename a event.  Called by the editable field.
 * @param {string} name The proposed new name.
 * @return {string} The accepted name.
 * @this {Blockly.Field}
 */
Blockly.Events.rename = function(name) {
  // Strip leading and trailing whitespace.  Beyond this, all names are legal.
  name = name.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');

  // Ensure two identically-named events don't exist.
  var legalName = Blockly.Events.findLegalName(name, this.sourceBlock_);
  var oldName = this.text_;
  if (oldName != name && oldName != legalName) {
    // Rename any callers.
    var blocks = this.sourceBlock_.workspace.getAllBlocks(false);
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].renameEvent) {
        blocks[i].renameEvent(oldName, legalName);
      }
    }
  }
  return legalName;
};

/**
 * Construct the blocks required by the flyout for the event category.
 * @param {!Blockly.Workspace} workspace The workspace containing events.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Events.flyoutCategory = function(workspace) {
  var xmlList = [];
  if (Blockly.Blocks['events_defnoreturn']) {
    // <block type="events_defnoreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    var block = Blockly.Xml.utils.createElement('block');
    block.setAttribute('type', 'events_defnoreturn');
    block.setAttribute('gap', 16);
    var nameField = Blockly.Xml.utils.createElement('field');
    nameField.setAttribute('name', 'NAME');
    nameField.appendChild(Blockly.Xml.utils.createTextNode(
        Blockly.Msg['EVENTS_DEFNORETURN_EVENT']));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks['events_defreturn']) {
    // <block type="events_defreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    var block = Blockly.Xml.utils.createElement('block');
    block.setAttribute('type', 'events_defreturn');
    block.setAttribute('gap', 16);
    var nameField = Blockly.Xml.utils.createElement('field');
    nameField.setAttribute('name', 'NAME');
    nameField.appendChild(Blockly.Xml.utils.createTextNode(
        Blockly.Msg['EVENTS_DEFRETURN_EVENT']));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks['events_ifreturn']) {
    // <block type="events_ifreturn" gap="16"></block>
    var block = Blockly.Xml.utils.createElement('block');
    block.setAttribute('type', 'events_ifreturn');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  if (xmlList.length) {
    // Add slightly larger gap between system blocks and user calls.
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
  }

  function populateEvents(eventList, templateName) {
    for (var i = 0; i < eventList.length; i++) {
      var name = eventList[i][0];
      var args = eventList[i][1];
      // <block type="events_callnoreturn" gap="16">
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

  var tuple = Blockly.Events.allEvents(workspace);
  populateEvents(tuple[0], 'events_callnoreturn');
  populateEvents(tuple[1], 'events_callreturn');
  return xmlList;
};

/**
 * Find all the callers of a named event.
 * @param {string} name Name of event.
 * @param {!Blockly.Workspace} workspace The workspace to find callers in.
 * @return {!Array.<!Blockly.Block>} Array of caller blocks.
 */
Blockly.Events.getCallers = function(name, workspace) {
  var callers = [];
  var blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getEventCall) {
      var procName = blocks[i].getEventCall();
      // Event name may be null if the block is only half-built.
      if (procName && Blockly.Names.equals(procName, name)) {
        callers.push(blocks[i]);
      }
    }
  }
  return callers;
};

/**
 * When a event definition changes its parameters, find and edit all its
 * callers.
 * @param {!Blockly.Block} defBlock Event definition block.
 */
Blockly.Events.mutateCallers = function(defBlock) {
  var oldRecordUndo = Blockly.Events.recordUndo;
  var name = defBlock.getEventDef()[0];
  var xmlElement = defBlock.mutationToDom(true);
  var callers = Blockly.Events.getCallers(name, defBlock.workspace);
  for (var i = 0, caller; caller = callers[i]; i++) {
    var oldMutationDom = caller.mutationToDom();
    var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
    caller.domToMutation(xmlElement);
    var newMutationDom = caller.mutationToDom();
    var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
    if (oldMutation != newMutation) {
      // Fire a mutation on every caller block.  But don't record this as an
      // undo action since it is deterministically tied to the event's
      // definition mutation.
      Blockly.Events.recordUndo = false;
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          caller, 'mutation', null, oldMutation, newMutation));
      Blockly.Events.recordUndo = oldRecordUndo;
    }
  }
};

/**
 * Find the definition block for the named event.
 * @param {string} name Name of event.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {Blockly.Block} The event definition block, or null not found.
 */
Blockly.Events.getDefinition = function(name, workspace) {
  // Assume that a event definition is a top block.
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].getEventDef) {
      var tuple = blocks[i].getEventDef();
      if (tuple && Blockly.Names.equals(tuple[0], name)) {
        return blocks[i];
      }
    }
  }
  return null;
};
