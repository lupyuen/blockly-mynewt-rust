/// Code Generator Functions for App Blocks

Blockly.Rust['app'] = function(block) {
  //  Generate CoAP message payload:
  //  app!( @json {        
  //    "device": &device_id,
  //    sensor_data,
  //  })
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Rust.valueToCode(block, 'ADD' + i,
            Blockly.Rust.ORDER_NONE) || '\'\'';
  }
  var code = [
    '//  Create a column',
    'let mut col = Column::new();',
    '//  Add the widgets to the column',
    //  Insert the elements.
    elements.join('\n'),
    /*
    Blockly.Rust.prefixLines(
      elements.join('\n'), 
      Blockly.Rust.INDENT),
    */
    '//  Return the column containing the widgets',
    'col',
  ].join('\n');
  return [code, Blockly.Rust.ORDER_UNARY_POSTFIX];
};

Blockly.Rust['label'] = function(block) {
  //  Generate a Label Widget
  var text_name = block.getFieldValue('NAME');
  var value_name = Blockly.Rust.valueToCode(block, 'name', Blockly.JavaScript.ORDER_ATOMIC);
  var code = [
    '//  Add the label widget to the column, centered with padding',
    'col.add_child(',
      'Align::centered(',
        'Padding::new(5.0, ',
          text_name,
        ')',
      '),',
      '1.0',
    ');',
  ].join('\n');

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Rust.ORDER_NONE];
};

Blockly.Rust['button'] = function(block) {
  //  Generate a Button Widget
  var text_name = block.getFieldValue('NAME');
  var value_name = Blockly.Rust.valueToCode(block, 'name', Blockly.JavaScript.ORDER_ATOMIC);
  var code = [
    '//  Add the button widget to the column, with padding',
    'col.add_child(',
      'Padding::new(5.0, ',
        text_name,
      ')',
    '1.0',
    ');',
  ].join('\n');
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Rust.ORDER_NONE];
};
