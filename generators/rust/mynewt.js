Blockly.Dart['digital_toggle_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  // TODO: Assemble Dart into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Dart['forever'] = function(block) {
  var statements_stmts = Blockly.Dart.statementToCode(block, 'STMTS');
  // TODO: Assemble Dart into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Dart['wait'] = function(block) {
  var number_duration = block.getFieldValue('DURATION');
  // TODO: Assemble Dart into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Dart['on_start'] = function(block) {
  var statements_stmts = Blockly.Dart.statementToCode(block, 'STMTS');
  // TODO: Assemble Dart into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Dart['digital_read_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  // TODO: Assemble Dart into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

Blockly.Dart['digital_write_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  var dropdown_value = block.getFieldValue('VALUE');
  // TODO: Assemble Dart into code variable.
  var code = '...;\n';
  return code;
};