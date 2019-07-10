//  TODO: Replace all Dart by Rust
Blockly.Rust['digital_toggle_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  // TODO: Assemble Rust into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Rust['forever'] = function(block) {
  var statements_stmts = Blockly.Rust.statementToCode(block, 'STMTS');
  // TODO: Assemble Rust into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Rust['wait'] = function(block) {
  var number_duration = block.getFieldValue('DURATION');
  // TODO: Assemble Rust into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Rust['on_start'] = function(block) {
  var statements_stmts = Blockly.Rust.statementToCode(block, 'STMTS');
  // TODO: Assemble Rust into code variable.
  var code = '...;\n';
  return code;
};

Blockly.Rust['digital_read_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  // TODO: Assemble Rust into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Rust.ORDER_NONE];
};

Blockly.Rust['digital_write_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  var dropdown_value = block.getFieldValue('VALUE');
  // TODO: Assemble Rust into code variable.
  var code = '...;\n';
  return code;
};