/// Code Generator Functions for Custom Blocks in mynewt_blocks.js.
/// Initially exported by Block Exporter from mynewt_library.xml.


Blockly.Rust['coap'] = function(block) {
  //  Generate CoAP message payload:
  //  coap!( @json {        
  //    "device": &device_id,
  //    sensor_data,
  //  })
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Rust.valueToCode(block, 'ADD' + i,
            Blockly.Rust.ORDER_NONE) || '\'\'';
  }
  var code = [
    'coap!( @json {',
    //  Insert the indented elements.
    Blockly.Rust.prefixLines(
      elements.join(',\n'), 
      Blockly.Rust.INDENT),
    '})',
  ].join('\n');
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['field'] = function(block) {
  //  Generate a field for CoAP message payload: `name: value`
  var text_name = block.getFieldValue('NAME');
  var value_name = Blockly.Rust.valueToCode(block, 'name', Blockly.JavaScript.ORDER_ATOMIC);
  var code = [
    '"', text_name, '"',
    ': ',
    value_name,
  ].join('');
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Rust.ORDER_NONE];
};

Blockly.Rust['on_start'] = function(block) {
  var statements_stmts = Blockly.Rust.statementToCode(block, 'STMTS');
  var code = statements_stmts;
  if (code) {
    code = Blockly.Rust.prefixLines(code, Blockly.Rust.INDENT);
  }
  //  TODO: Allow multiple `on_start` blocks.
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
  // Indent every line twice.
  var code = statements_stmts;
  if (code) {
    code = Blockly.Rust.prefixLines(code, Blockly.Rust.INDENT);
    code = Blockly.Rust.prefixLines(code, Blockly.Rust.INDENT);
  }
  //  TODO: Allow multiple Background Tasks for multiple `forever` blocks.
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
    '',
    '/// Start the Background Task',
    'fn start_task() -> MynewtResult<()> {',
    '    os::task_init(          //  Create a new task and start it...',
    '        out!( TASK_OBJ ),   //  Task object will be saved here',
    '        strn!( "forever" ), //  Name of task',
    '        Some( task_func ),  //  Function to execute when task starts',
    '        NULL,  //  Argument to be passed to above function',
    '        10,    //  Task priority: highest is 0, lowest is 255 (main task is 127)',
    '        os::OS_WAIT_FOREVER as u32, //  Don\'t do sanity / watchdog checking',
    '        out!( TASK_STACK ),         //  Stack space for the task',
    '        TASK_STACK_SIZE as u16      //  Size of the stack (in 4-byte units)',
    '    ) ? ;                           //  `?` means check for error',
    '    //  Return success to `main()`.',
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
  //  TODO: Call init_out only once,
  var code = [
    '//  Toggle the GPIO pin',
    'gpio::toggle(' + dropdown_pin + ') ? ;',
    ''
  ].join('\n');
  return code;
};

Blockly.Rust['digital_read_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  //  TODO: Call init_in only once: gpio::init_in(MCU_GPIO_PORTC!(13), pull_type) ? ;
  var code = 'gpio::read(' + dropdown_pin + ')';
  //  TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Rust.ORDER_NONE];
};

Blockly.Rust['digital_write_pin'] = function(block) {
  var dropdown_pin = block.getFieldValue('PIN');
  var dropdown_value = block.getFieldValue('VALUE');
  //  TODO: Call init_out only once,
  var code = [
    '//  Configure the GPIO pin for output and set the value.',
    'gpio::init_out(' + dropdown_pin + ', ' + dropdown_value + ') ? ;',
    'gpio::write(' + dropdown_pin + ',' + dropdown_value + ') ? ;',
    ''
  ].join('\n');  
  return code;
};