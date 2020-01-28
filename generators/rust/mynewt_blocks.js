/// Custom blocks exported from Block Exporter based on mynewt_library.xml.
/// See mynewt_functions.js for Code Generator Functions.
var mynewt_blocks =
// Begin Block Exporter
[{
  "type": "digital_toggle_pin",
  "message0": "digital toggle pin %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "PIN",
      "options": [
        [
          "PA1",
          "MCU_GPIO_PORTA!(1)"
        ],
        [
          "PB1",
          "MCU_GPIO_PORTB!(1)"
        ],
        [
          "PC13",
          "MCU_GPIO_PORTC!(13)"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "previousStatement": "Action",
  "nextStatement": "Action",
  "colour": 330,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "forever",
  "message0": "forever %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STMTS"
    }
  ],
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "wait",
  "message0": "wait %1 seconds",
  "args0": [
    {
      "type": "field_number",
      "name": "DURATION",
      "value": 0,
      "min": 0,
      "precision": 1
    }
  ],
  "previousStatement": "Action",
  "nextStatement": "Action",
  "colour": 160,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "on_start",
  "message0": "on start %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STMTS"
    }
  ],
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "digital_read_pin",
  "message0": "digital read pin %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "PIN",
      "options": [
        [
          "PA1",
          "MCU_GPIO_PORTA!(1)"
        ],
        [
          "PB1",
          "MCU_GPIO_PORTB!(1)"
        ],
        [
          "PC13",
          "MCU_GPIO_PORTC!(13)"
        ]
      ]
    }
  ],
  "output": "Number",
  "colour": 330,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "digital_write_pin",
  "message0": "digital write pin %1 to %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "PIN",
      "options": [
        [
          "PA1",
          "MCU_GPIO_PORTA!(1)"
        ],
        [
          "PB1",
          "MCU_GPIO_PORTB!(1)"
        ],
        [
          "PC13",
          "MCU_GPIO_PORTC!(13)"
        ]
      ]
    },
    {
      "type": "field_dropdown",
      "name": "VALUE",
      "options": [
        [
          "LOW",
          "0"
        ],
        [
          "HIGH",
          "1"
        ]
      ]
    }
  ],
  "previousStatement": "Action",
  "nextStatement": "Action",
  "colour": 330,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "field",
  "message0": "field %1 %2 value %3",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "field_input",
      "name": "NAME",
      "text": "name"
    },
    {
      "type": "input_value",
      "name": "name"
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "label",
  "message0": "label %1 %2 %3 padding %4 %5",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "field_input",
      "name": "NAME",
      "text": "name"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_number",
      "name": "PADDING",
      "value": 0,
      "min": 0,
      "max": 240
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "button",
  "message0": "button %1 %2 %3 padding %4 %5",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "field_input",
      "name": "NAME",
      "text": "name"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_number",
      "name": "PADDING",
      "value": 0,
      "min": 0,
      "max": 240
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "on_label_show",
  "message0": "on label %1 show %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "NAME",
      "text": "name"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "NAME"
    }
  ],
  "inputsInline": true,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "on_button_press",
  "message0": "on button %1 press %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "NAME",
      "text": "name"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "NAME"
    }
  ],
  "inputsInline": true,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
}]
// End Block Exporter
;