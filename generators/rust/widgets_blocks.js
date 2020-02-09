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
 * @fileoverview Widget blocks for Blockly.
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

goog.provide('Blockly.Blocks.widgets');

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['widgets_defnoreturn'] = {
  /**
   * Block for defining a widget with no return value.
   * @this Blockly.Block
   */
  init: function() {
    Blockly.Msg['WIDGETS_DEFNORETURN_TOOLTIP'] = 'WIDGETS_DEFNORETURN_TOOLTIP'; ////
    Blockly.Msg['WIDGETS_DEFNORETURN_HELPURL'] = 'WIDGETS_DEFNORETURN_HELPURL'; ////
    var nameField = new Blockly.FieldTextInput('',
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Blockly.Msg['WIDGETS_DEFNORETURN_TITLE'])
        .appendField('on button') //// TODO
        .appendField(nameField, 'NAME')
        .appendField('press') //// TODO
        .appendField('', 'PARAMS');
    this.setMutator(new Blockly.Mutator(['widgets_mutatorarg']));
    if ((this.workspace.options.comments ||
         (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
        Blockly.Msg['WIDGETS_DEFNORETURN_COMMENT']) {
      this.setCommentText(Blockly.Msg['WIDGETS_DEFNORETURN_COMMENT']);
    }
    //// TODO: this.setStyle('widget_blocks');
    this.setStyle('procedure_blocks'); //// TODO
    this.setTooltip(Blockly.Msg['WIDGETS_DEFNORETURN_TOOLTIP']);
    this.setHelpUrl(Blockly.Msg['WIDGETS_DEFNORETURN_HELPURL']);
    this.arguments_ = ['ctx', 'state', 'env']; //// TODO
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  /**
   * Add or remove the statement block from this function definition.
   * @param {boolean} hasStatements True if a statement block is needed.
   * @this Blockly.Block
   */
  setStatements_: function(hasStatements) {
    Blockly.Msg['WIDGETS_DEFNORETURN_DO'] = ''; ////
    if (this.hasStatements_ === hasStatements) {
      return;
    }
    if (hasStatements) {
      this.appendStatementInput('STACK')
          .appendField(Blockly.Msg['WIDGETS_DEFNORETURN_DO']);
      if (this.getInput('RETURN')) {
        this.moveInputBefore('STACK', 'RETURN');
      }
    } else {
      this.removeInput('STACK', true);
    }
    this.hasStatements_ = hasStatements;
  },
  /**
   * Update the display of parameters for this widget definition block.
   * @private
   * @this Blockly.Block
   */
  updateParams_: function() {
    Blockly.Msg['WIDGETS_BEFORE_PARAMS'] = 'WIDGETS_BEFORE_PARAMS'; ////
    // Merge the arguments into a human-readable list.
    var paramString = '';
    if (this.arguments_.length) {
      paramString = Blockly.Msg['WIDGETS_BEFORE_PARAMS'] +
          ' ' + this.arguments_.join(', ');
    }
    // The params field is deterministic based on the mutation,
    // no need to fire a change event.
    Blockly.Events.disable();
    try {
      this.setFieldValue(paramString, 'PARAMS');
    } finally {
      Blockly.Events.enable();
    }
  },
  /**
   * Create XML to represent the argument inputs.
   * @param {boolean=} opt_paramIds If true include the IDs of the parameter
   *     quarks.  Used by Blockly.Procedures.mutateCallers for reconnection.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function(opt_paramIds) {
    var container = document.createElement('mutation');
    if (opt_paramIds) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      var parameter = document.createElement('arg');
      var argModel = this.argumentVarModels_[i];
      parameter.setAttribute('name', argModel.name);
      parameter.setAttribute('varid', argModel.getId());
      if (opt_paramIds && this.paramIds_) {
        parameter.setAttribute('paramId', this.paramIds_[i]);
      }
      container.appendChild(parameter);
    }

    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    return container;
  },
  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        var varName = childNode.getAttribute('name');
        var varId = childNode.getAttribute('varid') || childNode.getAttribute('varId');
        this.arguments_.push(varName);
        var variable = Blockly.Variables.getOrCreateVariablePackage(
            this.workspace, varId, varName, '');
        if (variable != null) {
          this.argumentVarModels_.push(variable);
        } else {
          console.log('Failed to create a variable with name ' + varName + ', ignoring.');
        }
      }
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show or hide the statement input.
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('widgets_mutatorcontainer');
    containerBlock.initSvg();

    // Check/uncheck the allow statement box.
    if (this.getInput('RETURN')) {
      containerBlock.setFieldValue(
          this.hasStatements_ ? 'TRUE' : 'FALSE', 'STATEMENTS');
    } else {
      containerBlock.getInput('STATEMENT_INPUT').setVisible(false);
    }

    // Parameter list.
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.arguments_.length; i++) {
      var paramBlock = workspace.newBlock('widgets_mutatorarg');
      paramBlock.initSvg();
      paramBlock.setFieldValue(this.arguments_[i], 'NAME');
      // Store the old location.
      paramBlock.oldLocation = i;
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    // Initialize widget's callers with blank IDs.
    Blockly.Procedures.mutateCallers(this);
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Parameter list.
    this.arguments_ = [];
    this.paramIds_ = [];
    this.argumentVarModels_ = [];
    var paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock) {
      var varName = paramBlock.getFieldValue('NAME');
      this.arguments_.push(varName);
      var variable = this.workspace.getVariable(varName, '');
      if (variable != null) {
        this.argumentVarModels_.push(variable);
      } else {
        console.log('Failed to get variable named ' + varName + ', ignoring.');
      }

      this.paramIds_.push(paramBlock.id);
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show/hide the statement input.
    var hasStatements = containerBlock.getFieldValue('STATEMENTS');
    if (hasStatements !== null) {
      hasStatements = hasStatements == 'TRUE';
      if (this.hasStatements_ != hasStatements) {
        if (hasStatements) {
          this.setStatements_(true);
          // Restore the stack, if one was saved.
          Blockly.Mutator.reconnect(this.statementConnection_, this, 'STACK');
          this.statementConnection_ = null;
        } else {
          // Save the stack, then disconnect it.
          var stackConnection = this.getInput('STACK').connection;
          this.statementConnection_ = stackConnection.targetConnection;
          if (this.statementConnection_) {
            var stackBlock = stackConnection.targetBlock();
            stackBlock.unplug();
            stackBlock.bumpNeighbours_();
          }
          this.setStatements_(false);
        }
      }
    }
  },
  /**
   * Return the signature of this widget definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined widget,
   *     - a list of all its arguments,
   *     - that it DOES NOT have a return value.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return this.arguments_;
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<!Blockly.VariableModel>} List of variable models.
   * @this Blockly.Block
   */
  getVarModels: function() {
    return this.argumentVarModels_;
  },
  /**
   * Notification that a variable is renaming.
   * If the ID matches one of this block's variables, rename it.
   * @param {string} oldId ID of variable to rename.
   * @param {string} newId ID of new variable.  May be the same as oldId, but
   *     with an updated name.  Guaranteed to be the same type as the old
   *     variable.
   * @override
   * @this Blockly.Block
   */
  renameVarById: function(oldId, newId) {
    var oldVariable = this.workspace.getVariableById(oldId);
    if (oldVariable.type != '') {
      // Procedure arguments always have the empty type.
      return;
    }
    var oldName = oldVariable.name;
    var newVar = this.workspace.getVariableById(newId);

    var change = false;
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() == oldId) {
        this.arguments_[i] = newVar.name;
        this.argumentVarModels_[i] = newVar;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newVar.name);
      Blockly.Procedures.mutateCallers(this);
    }
  },
  /**
   * Notification that a variable is renaming but keeping the same ID.  If the
   * variable is in use on this block, rerender to show the new name.
   * @param {!Blockly.VariableModel} variable The variable being renamed.
   * @package
   * @override
   * @this Blockly.Block
   */
  updateVarName: function(variable) {
    var newName = variable.name;
    var change = false;
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() == variable.getId()) {
        var oldName = this.arguments_[i];
        this.arguments_[i] = newName;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newName);
      Blockly.Procedures.mutateCallers(this);
    }
  },
  /**
   * Update the display to reflect a newly renamed argument.
   * @param {string} oldName The old display name of the argument.
   * @param {string} newName The new display name of the argument.
   * @private
   */
  displayRenamedVar_: function(oldName, newName) {
    this.updateParams_();
    // Update the mutator's variables if the mutator is open.
    if (this.mutator.isVisible()) {
      var blocks = this.mutator.workspace_.getAllBlocks(false);
      for (var i = 0, block; block = blocks[i]; i++) {
        if (block.type == 'widgets_mutatorarg' &&
            Blockly.Names.equals(oldName, block.getFieldValue('NAME'))) {
          block.setFieldValue(newName, 'NAME');
        }
      }
    }
  },
  /**
   * Add custom menu options to this block's context menu.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    Blockly.Msg['WIDGETS_CREATE_DO'] = 'WIDGETS_CREATE_DO';  ////
    if (this.isInFlyout){
      return;
    }
    // Add option to create caller.
    var option = {enabled: true};
    var name = this.getFieldValue('NAME');
    option.text = Blockly.Msg['WIDGETS_CREATE_DO'].replace('%1', name);
    var xmlMutation = document.createElement('mutation');
    xmlMutation.setAttribute('name', name);
    for (var i = 0; i < this.arguments_.length; i++) {
      var xmlArg = document.createElement('arg');
      xmlArg.setAttribute('name', this.arguments_[i]);
      xmlMutation.appendChild(xmlArg);
    }
    var xmlBlock = document.createElement('block');
    xmlBlock.setAttribute('type', this.callType_);
    xmlBlock.appendChild(xmlMutation);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    if (!this.isCollapsed()) {
      for (var i = 0; i < this.argumentVarModels_.length; i++) {
        var option = {enabled: true};
        var argVar = this.argumentVarModels_[i];
        var name = argVar.name;
        option.text = Blockly.Msg['VARIABLES_SET_CREATE_GET'].replace('%1', name);

        var xmlField = Blockly.Variables.generateVariableFieldDom(argVar);
        var xmlBlock = document.createElement('block');
        xmlBlock.setAttribute('type', 'variables_get');
        xmlBlock.appendChild(xmlField);
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
      }
    }
  },
  callType_: 'widgets_callnoreturn'
};

Blockly.Blocks['widgets_defreturn'] = {
  /**
   * Block for defining a widget with a return value.
   * @this Blockly.Block
   */
  init: function() {
    Blockly.Msg['WIDGETS_DEFRETURN_TITLE'] = ''; ////
    Blockly.Msg['WIDGETS_DEFRETURN_RETURN'] = 'return'; ////
    Blockly.Msg['WIDGETS_DEFRETURN_COMMENT'] = ''; ////
    Blockly.Msg['WIDGETS_DEFRETURN_TOOLTIP'] = 'WIDGETS_DEFRETURN_TOOLTIP'; ////
    Blockly.Msg['WIDGETS_DEFRETURN_HELPURL'] = 'WIDGETS_DEFRETURN_HELPURL'; ////
    var nameField = new Blockly.FieldTextInput('',
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Blockly.Msg['WIDGETS_DEFRETURN_TITLE'])
        .appendField('on label') //// TODO
        .appendField(nameField, 'NAME')
        .appendField('show') //// TODO
        .appendField('', 'PARAMS');
    this.appendValueInput('RETURN')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg['WIDGETS_DEFRETURN_RETURN']);
    this.setMutator(new Blockly.Mutator(['widgets_mutatorarg']));
    if ((this.workspace.options.comments ||
         (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
        Blockly.Msg['WIDGETS_DEFRETURN_COMMENT']) {
      this.setCommentText(Blockly.Msg['WIDGETS_DEFRETURN_COMMENT']);
    }
    //// TODO: this.setStyle('widget_blocks');
    this.setStyle('procedure_blocks'); //// TODO
    this.setTooltip(Blockly.Msg['WIDGETS_DEFRETURN_TOOLTIP']);
    this.setHelpUrl(Blockly.Msg['WIDGETS_DEFRETURN_HELPURL']);
    this.arguments_ = ['state', 'env']; //// TODO
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  setStatements_: Blockly.Blocks['widgets_defnoreturn'].setStatements_,
  updateParams_: Blockly.Blocks['widgets_defnoreturn'].updateParams_,
  mutationToDom: Blockly.Blocks['widgets_defnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['widgets_defnoreturn'].domToMutation,
  decompose: Blockly.Blocks['widgets_defnoreturn'].decompose,
  compose: Blockly.Blocks['widgets_defnoreturn'].compose,
  /**
   * Return the signature of this widget definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined widget,
   *     - a list of all its arguments,
   *     - that it DOES have a return value.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, true];
  },
  getVars: Blockly.Blocks['widgets_defnoreturn'].getVars,
  getVarModels: Blockly.Blocks['widgets_defnoreturn'].getVarModels,
  renameVarById: Blockly.Blocks['widgets_defnoreturn'].renameVarById,
  updateVarName: Blockly.Blocks['widgets_defnoreturn'].updateVarName,
  displayRenamedVar_: Blockly.Blocks['widgets_defnoreturn'].displayRenamedVar_,
  customContextMenu: Blockly.Blocks['widgets_defnoreturn'].customContextMenu,
  callType_: 'widgets_callreturn'
};

Blockly.Blocks['widgets_mutatorcontainer'] = {
  /**
   * Mutator block for widget container.
   * @this Blockly.Block
   */
  init: function() {
    Blockly.Msg['WIDGETS_MUTATORCONTAINER_TITLE'] = 'WIDGETS_MUTATORCONTAINER_TITLE'; ////
    Blockly.Msg['WIDGETS_ALLOW_STATEMENTS'] = 'WIDGETS_ALLOW_STATEMENTS'; ////
    Blockly.Msg['WIDGETS_MUTATORCONTAINER_TOOLTIP'] = 'WIDGETS_MUTATORCONTAINER_TOOLTIP'; ////
    this.appendDummyInput()
        .appendField(Blockly.Msg['WIDGETS_MUTATORCONTAINER_TITLE']);
    this.appendStatementInput('STACK');
    this.appendDummyInput('STATEMENT_INPUT')
        .appendField(Blockly.Msg['WIDGETS_ALLOW_STATEMENTS'])
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'STATEMENTS');
    //// TODO: this.setStyle('widget_blocks');
    this.setStyle('procedure_blocks'); //// TODO
    this.setTooltip(Blockly.Msg['WIDGETS_MUTATORCONTAINER_TOOLTIP']);
    this.contextMenu = false;
  },
  /**
   * This will create & delete variables and in dialogs workspace to ensure
   * that when a new block is dragged out it will have a unique parameter name.
   * @param {!Blockly.Events.Abstract} event Change event.
   * @this Blockly.Block
   */
  onchange: function(event) {
    if (!this.workspace || this.workspace.isFlyout ||
        (event.type != Blockly.Events.BLOCK_DELETE && event.type != Blockly.Events.BLOCK_CREATE)) {
      return;
    }
    var blocks = this.workspace.getAllBlocks();
    var allVariables = this.workspace.getAllVariables();
    if (event.type == Blockly.Events.BLOCK_DELETE) {
      var variableNamesToKeep = [];
      for (var i = 0; i < blocks.length; i += 1) {
        if (blocks[i].getFieldValue('NAME')) {
          variableNamesToKeep.push(blocks[i].getFieldValue('NAME'));
        }
      }
      for (var k = 0; k < allVariables.length; k += 1) {
        if (variableNamesToKeep.indexOf(allVariables[k].name) == -1) {
          this.workspace.deleteVariableById(allVariables[k].getId());
        }
      }
      return;
    }
      
    if (event.type != Blockly.Events.BLOCK_CREATE) {
      return;
    }

    var block = this.workspace.getBlockById(event.blockId);
    // This is to handle the one none variable block
    // Happens when all the blocks are regenerated
    if (!block.getField('NAME')) {
      return;
    }
    var varName = block.getFieldValue('NAME');
    var variable = this.workspace.getVariable(varName);

    if (!variable) {
      // This means the parameter name is not in use and we can create the variable.
      variable = this.workspace.createVariable(varName);
    }
    // If the blocks are connected we don't have to check duplicate variables
    // This only happens if the dialog box is open
    if (block.previousConnection.isConnected() || block.nextConnection.isConnected()) {
      return;
    }

    for (var j = 0; j < blocks.length; j += 1) {
      // filter block that was created
      if (block.id != blocks[j].id && blocks[j].getFieldValue('NAME') == variable.name) {
        // generate new name and set name field
        varName = Blockly.Variables.generateUniqueName(this.workspace);
        variable = this.workspace.createVariable(varName);
        block.setFieldValue(variable.name, 'NAME');
        return;
      }
    }
  }
};


Blockly.Blocks['widgets_mutatorarg'] = {
  /**
   * Mutator block for widget argument.
   * @this Blockly.Block
   */
  init: function() {
    Blockly.Msg['WIDGETS_MUTATORARG_TITLE'] = 'WIDGETS_MUTATORARG_TITLE'; ////
    Blockly.Msg['WIDGETS_MUTATORARG_TOOLTIP'] = 'WIDGETS_MUTATORARG_TOOLTIP'; ////
    var field = new Blockly.FieldTextInput('x', this.validator_);
    // Hack: override showEditor to do just a little bit more work.
    // We don't have a good place to hook into the start of a text edit.
    field.oldShowEditorFn_ = field.showEditor_;
    var newShowEditorFn = function() {
      this.createdVariables_ = [];
      this.oldShowEditorFn_();
    };
    field.showEditor_ = newShowEditorFn;

    this.appendDummyInput()
        .appendField(Blockly.Msg['WIDGETS_MUTATORARG_TITLE'])
        .appendField(field, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    //// TODO: this.setStyle('widget_blocks');
    this.setStyle('procedure_blocks'); //// TODO
    this.setTooltip(Blockly.Msg['WIDGETS_MUTATORARG_TOOLTIP']);
    this.contextMenu = false;

    // Create the default variable when we drag the block in from the flyout.
    // Have to do this after installing the field on the block.
    field.onFinishEditing_ = this.deleteIntermediateVars_;
    // Create an empty list so onFinishEditing_ has something to look at, even
    // though the editor was never opened.
    field.createdVariables_ = [];
    field.onFinishEditing_('x');
  },

  /**
   * Obtain a valid name for the widget argument. Create a variable if
   * necessary.
   * Merge runs of whitespace.  Strip leading and trailing whitespace.
   * Beyond this, all names are legal.
   * @param {string} varName User-supplied name.
   * @return {?string} Valid name, or null if a name was not specified.
   * @private
   * @this Blockly.FieldTextInput
   */
  validator_: function(varName) {
    var outerWs = Blockly.Mutator.findParentWs(this.sourceBlock_.workspace);
    varName = varName.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    if (!varName) {
      return null;
    }
    // Prevents duplicate parameter names in functions
    var blocks = this.sourceBlock_.workspace.getAllBlocks();
    for (var i = 0; i < blocks.length; i += 1) {
      if (blocks[i].id == this.sourceBlock_.id) {
        continue;
      }
      if (blocks[i].getFieldValue('NAME') == varName) {
        return null;
      }
    }
    var model = outerWs.getVariable(varName, '');
    if (model && model.name != varName) {
      // Rename the variable (case change)
      outerWs.renameVarById(model.getId(), varName);
    }
    if (!model) {
      model = outerWs.createVariable(varName, '');
      if (model && this.createdVariables_) {
        this.createdVariables_.push(model);
      }
    }
    return varName;
  },
  /**
   * Called when focusing away from the text field.
   * Deletes all variables that were created as the user typed their intended
   * variable name.
   * @param {string} newText The new variable name.
   * @private
   * @this Blockly.FieldTextInput
   */
  deleteIntermediateVars_: function(newText) {
    var outerWs = Blockly.Mutator.findParentWs(this.sourceBlock_.workspace);
    if (!outerWs) {
      return;
    }
    for (var i = 0; i < this.createdVariables_.length; i++) {
      var model = this.createdVariables_[i];
      if (model.name != newText) {
        outerWs.deleteVariableById(model.getId());
      }
    }
  }
};

Blockly.Blocks['widgets_callnoreturn'] = {
  /**
   * Block for calling a widget with no return value.
   * @this Blockly.Block
   */
  init: function() {
    Blockly.Msg['WIDGETS_CALLNORETURN_HELPURL'] = 'https://WIDGETS_CALLNORETURN_HELPURL'; ////
    this.appendDummyInput('TOPROW')
        .appendField(this.id, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    //// TODO: this.setStyle('widget_blocks');
    this.setStyle('procedure_blocks'); //// TODO
    // Tooltip is set in renameProcedure.
    this.setHelpUrl(Blockly.Msg['WIDGETS_CALLNORETURN_HELPURL']);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
    this.previousDisabledState_ = false;
  },

  /**
   * Returns the name of the widget this block calls.
   * @return {string} Procedure name.
   * @this Blockly.Block
   */
  getProcedureCall: function() {
    // The NAME field is guaranteed to exist, null will never be returned.
    return /** @type {string} */ (this.getFieldValue('NAME'));
  },
  /**
   * Notification that a widget is renaming.
   * If the name matches this block's widget, rename it.
   * @param {string} oldName Previous name of widget.
   * @param {string} newName Renamed widget.
   * @this Blockly.Block
   */
  renameProcedure: function(oldName, newName) {
    Blockly.Msg['WIDGETS_CALLRETURN_TOOLTIP'] = 'WIDGETS_CALLRETURN_TOOLTIP'; ////
    Blockly.Msg['WIDGETS_CALLNORETURN_TOOLTIP'] = 'WIDGETS_CALLNORETURN_TOOLTIP'; ////
    if (Blockly.Names.equals(oldName, this.getProcedureCall())) {
      this.setFieldValue(newName, 'NAME');
      var baseMsg = this.outputConnection ?
          Blockly.Msg['WIDGETS_CALLRETURN_TOOLTIP'] :
          Blockly.Msg['WIDGETS_CALLNORETURN_TOOLTIP'];
      this.setTooltip(baseMsg.replace('%1', newName));
    }
  },
  /**
   * Notification that the widget's parameters have changed.
   * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
   * @param {!Array.<string>} paramIds IDs of params (consistent for each
   *     parameter through the life of a mutator, regardless of param renaming),
   *     e.g. ['piua', 'f8b_', 'oi.o'].
   * @private
   * @this Blockly.Block
   */
  setProcedureParameters_: function(paramNames, paramIds) {
    // Data structures:
    // this.arguments = ['x', 'y']
    //     Existing param names.
    // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
    //     Look-up of paramIds to connections plugged into the call block.
    // this.quarkIds_ = ['piua', 'f8b_']
    //     Existing param IDs.
    // Note that quarkConnections_ may include IDs that no longer exist, but
    // which might reappear if a param is reattached in the mutator.
    var defBlock = Blockly.Procedures.getDefinition(this.getProcedureCall(),
        this.workspace);
    var mutatorOpen = defBlock && defBlock.mutator &&
        defBlock.mutator.isVisible();
    if (!mutatorOpen) {
      this.quarkConnections_ = {};
      this.quarkIds_ = null;
    }
    if (!paramIds) {
      // Reset the quarks (a mutator is about to open).
      return;
    }
    // Test arguments (arrays of strings) for changes. '\n' is not a valid
    // argument name character, so it is a valid delimiter here.
    if (paramNames.join('\n') == this.arguments_.join('\n')) {
      // No change.
      this.quarkIds_ = paramIds;
      return;
    }
    if (paramIds.length != paramNames.length) {
      throw RangeError('paramNames and paramIds must be the same length.');
    }
    this.setCollapsed(false);
    if (!this.quarkIds_) {
      // Initialize tracking for this block.
      this.quarkConnections_ = {};
      this.quarkIds_ = [];
    }
    // Switch off rendering while the block is rebuilt.
    var savedRendered = this.rendered;
    this.rendered = false;
    // Update the quarkConnections_ with existing connections.
    for (var i = 0; i < this.arguments_.length; i++) {
      var input = this.getInput('ARG' + i);
      if (input) {
        var connection = input.connection.targetConnection;
        this.quarkConnections_[this.quarkIds_[i]] = connection;
        if (mutatorOpen && connection &&
            paramIds.indexOf(this.quarkIds_[i]) == -1) {
          // This connection should no longer be attached to this block.
          connection.disconnect();
          connection.getSourceBlock().bumpNeighbours_();
        }
      }
    }
    // Rebuild the block's arguments.
    this.arguments_ = [].concat(paramNames);
    // And rebuild the argument model list.
    this.argumentVarModels_ = [];
    for (var i = 0; i < this.arguments_.length; i++) {
      var variable = Blockly.Variables.getOrCreateVariablePackage(
          this.workspace, null, this.arguments_[i], '');
      this.argumentVarModels_.push(variable);
    }

    this.updateShape_();
    this.quarkIds_ = paramIds;
    // Reconnect any child blocks.
    if (this.quarkIds_) {
      for (var i = 0; i < this.arguments_.length; i++) {
        var quarkId = this.quarkIds_[i];
        if (quarkId in this.quarkConnections_) {
          var connection = this.quarkConnections_[quarkId];
          if (!Blockly.Mutator.reconnect(connection, this, 'ARG' + i)) {
            // Block no longer exists or has been attached elsewhere.
            delete this.quarkConnections_[quarkId];
          }
        }
      }
    }
    // Restore rendering and show the changes.
    this.rendered = savedRendered;
    if (this.rendered) {
      this.render();
    }
  },
  /**
   * Modify this block to have the correct number of arguments.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    Blockly.Msg['WIDGETS_CALL_BEFORE_PARAMS'] = 'WIDGETS_CALL_BEFORE_PARAMS';
    for (var i = 0; i < this.arguments_.length; i++) {
      var field = this.getField('ARGNAME' + i);
      if (field) {
        // Ensure argument name is up to date.
        // The argument name field is deterministic based on the mutation,
        // no need to fire a change event.
        Blockly.Events.disable();
        try {
          field.setValue(this.arguments_[i]);
        } finally {
          Blockly.Events.enable();
        }
      } else {
        // Add new input.
        field = new Blockly.FieldLabel(this.arguments_[i]);
        var input = this.appendValueInput('ARG' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(field, 'ARGNAME' + i);
        input.init();
      }
    }
    // Remove deleted inputs.
    while (this.getInput('ARG' + i)) {
      this.removeInput('ARG' + i);
      i++;
    }
    // Add 'with:' if there are parameters, remove otherwise.
    var topRow = this.getInput('TOPROW');
    if (topRow) {
      if (this.arguments_.length) {
        if (!this.getField('WITH')) {
          topRow.appendField(Blockly.Msg['WIDGETS_CALL_BEFORE_PARAMS'], 'WITH');
          topRow.init();
        }
      } else {
        if (this.getField('WITH')) {
          topRow.removeField('WITH');
        }
      }
    }
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getProcedureCall());
    for (var i = 0; i < this.arguments_.length; i++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.arguments_[i]);
      container.appendChild(parameter);
    }
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var name = xmlElement.getAttribute('name');
    this.renameProcedure(this.getProcedureCall(), name);
    var args = [];
    var paramIds = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        args.push(childNode.getAttribute('name'));
        paramIds.push(childNode.getAttribute('paramId'));
      }
    }
    this.setProcedureParameters_(args, paramIds);
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<!Blockly.VariableModel>} List of variable models.
   * @this Blockly.Block
   */
  getVarModels: function() {
    return this.argumentVarModels_;
  },
  /**
   * Procedure calls cannot exist without the corresponding widget
   * definition.  Enforce this link whenever an event is fired.
   * @param {!Blockly.Events.Abstract} event Change event.
   * @this Blockly.Block
   */
  onchange: function(event) {
    if (!this.workspace || this.workspace.isFlyout) {
      // Block is deleted or is in a flyout.
      return;
    }
    if (!event.recordUndo) {
      // Events not generated by user. Skip handling.
      return;
    }
    if (event.type == Blockly.Events.BLOCK_CREATE &&
      event.ids.indexOf(this.id) != -1) {
      // Look for the case where a widget call was created (usually through
      // paste) and there is no matching definition.  In this case, create
      // an empty definition block with the correct signature.
      var name = this.getProcedureCall();
      var def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (def && (def.type != this.defType_ ||
          JSON.stringify(def.arguments_) != JSON.stringify(this.arguments_))) {
        // The signatures don't match.
        def = null;
      }
      if (!def) {
        Blockly.Events.setGroup(event.group);
        /**
         * Create matching definition block.
         * <xml>
         *   <block type="widgets_defreturn" x="10" y="20">
         *     <mutation name="test">
         *       <arg name="x"></arg>
         *     </mutation>
         *     <field name="NAME">test</field>
         *   </block>
         * </xml>
         */
        var xml = document.createElement('xml');
        var block = document.createElement('block');
        block.setAttribute('type', this.defType_);
        var xy = this.getRelativeToSurfaceXY();
        var x = xy.x + Blockly.SNAP_RADIUS * (this.RTL ? -1 : 1);
        var y = xy.y + Blockly.SNAP_RADIUS * 2;
        block.setAttribute('x', x);
        block.setAttribute('y', y);
        var mutation = this.mutationToDom();
        block.appendChild(mutation);
        var field = document.createElement('field');
        field.setAttribute('name', 'NAME');
        field.appendChild(document.createTextNode(this.getProcedureCall()));
        block.appendChild(field);
        xml.appendChild(block);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        Blockly.Events.setGroup(false);
      }
    } else if (event.type == Blockly.Events.BLOCK_DELETE) {
      // Look for the case where a widget definition has been deleted,
      // leaving this block (a widget call) orphaned.  In this case, delete
      // the orphan.
      var name = this.getProcedureCall();
      var def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (!def) {
        Blockly.Events.setGroup(event.group);
        this.dispose(true, false);
        Blockly.Events.setGroup(false);
      }
    } else if (event.type == Blockly.Events.CHANGE && event.element == 'disabled') {
      var name = this.getProcedureCall();
      var def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (def && def.id == event.blockId) {
        // in most cases the old group should be ''
        var oldGroup = Blockly.Events.getGroup();
        if (oldGroup) {
          // This should only be possible programatically and may indicate a problem
          // with event grouping. If you see this message please investigate. If the
          // use ends up being valid we may need to reorder events in the undo stack.
          console.log('Saw an existing group while responding to a definition change');
        }
        Blockly.Events.setGroup(event.group);
        if (event.newValue) {
          this.previousDisabledState_ = this.disabled;
          this.setDisabled(true);
        } else {
          this.setDisabled(this.previousDisabledState_);
        }
        Blockly.Events.setGroup(oldGroup);
      }
    }
  },
  /**
   * Add menu option to find the definition block for this call.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    Blockly.Msg['WIDGETS_HIGHLIGHT_DEF'] = 'WIDGETS_HIGHLIGHT_DEF'; ////
    if (!this.workspace.isMovable()) {
      // If we center on the block and the workspace isn't movable we could
      // loose blocks at the edges of the workspace.
      return;
    }

    var option = {enabled: true};
    option.text = Blockly.Msg['WIDGETS_HIGHLIGHT_DEF'];
    var name = this.getProcedureCall();
    var workspace = this.workspace;
    option.callback = function() {
      var def = Blockly.Procedures.getDefinition(name, workspace);
      if (def) {
        workspace.centerOnBlock(def.id);
        def.select();
      }
    };
    options.push(option);
  },
  defType_: 'widgets_defnoreturn'
};

Blockly.Blocks['widgets_callreturn'] = {
  /**
   * Block for calling a widget with a return value.
   * @this Blockly.Block
   */
  init: function() {
    Blockly.Msg['WIDGETS_CALLRETURN_HELPURL'] = 'https://WIDGETS_CALLRETURN_HELPURL'; ////
    this.appendDummyInput('TOPROW')
        .appendField('', 'NAME');
    this.setOutput(true);
    //// TODO: this.setStyle('widget_blocks');
    this.setStyle('procedure_blocks'); //// TODO
    // Tooltip is set in domToMutation.
    this.setHelpUrl(Blockly.Msg['WIDGETS_CALLRETURN_HELPURL']);
    this.arguments_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
    this.previousDisabledState_ = false;
  },

  getProcedureCall: Blockly.Blocks['widgets_callnoreturn'].getProcedureCall,
  renameProcedure: Blockly.Blocks['widgets_callnoreturn'].renameProcedure,
  setProcedureParameters_:
      Blockly.Blocks['widgets_callnoreturn'].setProcedureParameters_,
  updateShape_: Blockly.Blocks['widgets_callnoreturn'].updateShape_,
  mutationToDom: Blockly.Blocks['widgets_callnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['widgets_callnoreturn'].domToMutation,
  getVarModels: Blockly.Blocks['widgets_callnoreturn'].getVarModels,
  onchange: Blockly.Blocks['widgets_callnoreturn'].onchange,
  customContextMenu:
      Blockly.Blocks['widgets_callnoreturn'].customContextMenu,
  defType_: 'widgets_defreturn'
};

Blockly.Blocks['widgets_ifreturn'] = {
  /**
   * Block for conditionally returning a value from a widget.
   * @this Blockly.Block
   */
  init: function() {
    Blockly.Msg['WIDGETS_DEFRETURN_RETURN'] = 'return'; ////
    Blockly.Msg['WIDGETS_IFRETURN_TOOLTIP'] = 'WIDGETS_IFRETURN_TOOLTIP'; ////
    Blockly.Msg['WIDGETS_IFRETURN_HELPURL'] = 'WIDGETS_IFRETURN_HELPURL'; ////
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_IF']);
    this.appendValueInput('VALUE')
        .appendField(Blockly.Msg['WIDGETS_DEFRETURN_RETURN']);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    //// TODO: this.setStyle('widget_blocks');
    this.setStyle('procedure_blocks'); //// TODO
    this.setTooltip(Blockly.Msg['WIDGETS_IFRETURN_TOOLTIP']);
    this.setHelpUrl(Blockly.Msg['WIDGETS_IFRETURN_HELPURL']);
    this.hasReturnValue_ = true;
  },
  /**
   * Create XML to represent whether this block has a return value.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('value', Number(this.hasReturnValue_));
    return container;
  },
  /**
   * Parse XML to restore whether this block has a return value.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    Blockly.Msg['WIDGETS_DEFRETURN_RETURN'] = 'return'; ////
    var value = xmlElement.getAttribute('value');
    this.hasReturnValue_ = (value == 1);
    if (!this.hasReturnValue_) {
      this.removeInput('VALUE');
      this.appendDummyInput('VALUE')
          .appendField(Blockly.Msg['WIDGETS_DEFRETURN_RETURN']);
    }
  },
  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!Blockly.Events.Abstract} e Change event.
   * @this Blockly.Block
   */
  onchange: function(/* e */) {
    Blockly.Msg['WIDGETS_DEFRETURN_RETURN'] = 'return'; ////
    Blockly.Msg['WIDGETS_IFRETURN_WARNING'] = 'WIDGETS_IFRETURN_WARNING'; ////
    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return;  // Don't change state at the start of a drag.
    }
    var legal = false;
    // Is the block nested in a widget?
    var block = this;
    do {
      if (this.FUNCTION_TYPES.indexOf(block.type) != -1) {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      // If needed, toggle whether this block has a return value.
      if (block.type == 'widgets_defnoreturn' && this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendDummyInput('VALUE')
            .appendField(Blockly.Msg['WIDGETS_DEFRETURN_RETURN']);
        this.hasReturnValue_ = false;
      } else if (block.type == 'widgets_defreturn' &&
                 !this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendValueInput('VALUE')
            .appendField(Blockly.Msg['WIDGETS_DEFRETURN_RETURN']);
        this.hasReturnValue_ = true;
      }
      this.setWarningText(null);
      if (!this.isInFlyout) {
        this.setDisabled(false);
      }
    } else {
      this.setWarningText(Blockly.Msg['WIDGETS_IFRETURN_WARNING']);
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setDisabled(true);
      }
    }
  },
  /**
   * List of block types that are functions and thus do not need warnings.
   * To add a new function type add this to your code:
   * Blockly.Blocks['widgets_ifreturn'].FUNCTION_TYPES.push('custom_func');
   */
  FUNCTION_TYPES: ['widgets_defnoreturn', 'widgets_defreturn']
};
