'use strict';

import robotnikBlocks from '../robotnik-blocks.js';
import robotnikGenerator from '../robotnik-generator.js';

export default function() {
  return { init, code, serialize, reloadWorkspace };
};

function init(canvas, toolbox) {
  robotnikGenerator.init();
  robotnikBlocks.init();

  Blockly.inject(canvas, {
    path: './vendor/blockly/',
    toolbox: toolbox,
    trashcan: true
  });
}

function code() {
  return Blockly.JavaScript.workspaceToCode();
}

function serialize() {
  let workspace = Blockly.mainWorkspace;
  let xml = Blockly.Xml.workspaceToDom(workspace);
  let serialized = Blockly.Xml.domToText(xml);
  return serialized;
}

function reloadWorkspace(data) {
  let xml = Blockly.Xml.textToDom(data);
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
}
    
