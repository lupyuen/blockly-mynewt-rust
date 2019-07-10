Blockly.Rust['on_start'] = function(block) {
  var statements_stmts = Blockly.Rust.statementToCode(block, 'STMTS');
  var code = statements_stmts;
  if (code) {
    code = Blockly.Rust.prefixLines(code, Blockly.Rust.INDENT);
  }
  code = [
    '/// Will be run upon startup to initialise the app',
    'fn on_start() -> MynewtResult<()> {',
    code,
    '    //  Return success to `main()`.',
    '    Ok(())',
    '}',
    ''
  ].join('\n');
  return code;
};

Blockly.Rust['forever'] = function(block) {
  var statements_stmts = Blockly.Rust.statementToCode(block, 'STMTS');
  // Indent every line.
  var code = statements_stmts;
  if (code) {
    code = Blockly.Rust.prefixLines(code, Blockly.Rust.INDENT);
    code = Blockly.Rust.prefixLines(code, Blockly.Rust.INDENT);
  }
  code = [
    '/// Will be run as Background Task that never terminates',
    'fn task_func(arg: Ptr) -> MynewtResult<()> {',
    '    //  Loop forever',
    '    loop {',
    code,
    '    }',
    '    // Never comes here',
    '    Ok(())',
    '}',
    ''
  ].join('\n');
  return code;
};

Blockly.Rust['wait'] = function(block) {
  var number_duration = block.getFieldValue('DURATION');
  var code = [
    '// Wait ' + number_duration + ' second(s)',
    'os::time_delay(' + number_duration + ' * OS_TICKS_PER_SEC) ? ;',
    ''
  ].join('\n');
  return code;
};

Blockly.Rust['digital_toggle_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  //  TODO: gpio::init_out(MCU_GPIO_PORTC!(13), 1) ? ;
  var code = [
    '//  Toggle the GPIO pin',
    'gpio::toggle(' + dropdown_pin + ') ? ;',
    ''
  ].join('\n');
  return code;
};

Blockly.Rust['digital_read_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  //  TODO: gpio::init_in(MCU_GPIO_PORTC!(13)) ? ;
  var code = '0 /* TODO: digital_read_pin */';
  //  TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Rust.ORDER_NONE];
};

Blockly.Rust['digital_write_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  var dropdown_value = block.getFieldValue('VALUE');
  //  TODO: gpio::init_out(MCU_GPIO_PORTC!(13), 1) ? ;
  var code = [
    '//  Configure the GPIO pin for output and set the value.',
    'gpio::init_out(' + dropdown_pin + ', ' + dropdown_value + ') ? ;',
    'gpio::write(' + dropdown_pin + ',' + dropdown_value + ') ? ;',
    ''
  ].join('\n');  
  return code;
};