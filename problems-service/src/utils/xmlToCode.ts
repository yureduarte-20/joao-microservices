import Blockly from 'blockly';

const xmlToCode = (xmlText: string) : string =>  {
    let xml = Blockly.Xml.textToDom(xmlText)
    var workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);
    return Blockly.JavaScript.workspaceToCode(workspace);
}
export default xmlToCode