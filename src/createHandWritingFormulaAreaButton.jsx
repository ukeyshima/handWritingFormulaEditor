//export to modeSelect.jsx
import React from 'react';
import { inject, observer } from 'mobx-react';
import { FaPencilAlt } from 'react-icons/fa';

@inject(({ state }) => ({
  activeTextFileType: state.activeTextFile.type,
  editor: state.editor,
  activeTextFileHandWritingFormulaAreaId:
    state.activeTextFile.handWritingFormulaAreaId,
  incrementHandWritingFormulaAreaId: state.incrementHandWritingFormulaAreaId,
  pushHandWritingFormulaAreas: state.pushHandWritingFormulaAreas
}))
@observer
export default class CreateHandWritingFormulaArea extends React.Component {
  constructor(props) {
    super(props);
    this.width = 500;
    this.height = 320;
    this.state = {
      backgroundColor: '#eee',
      fontColor: ' rgb(0, 185, 158)'
    };
  }
  handleClick = () => {
    if (
      this.props.activeTextFileType === 'javascript' ||
      this.props.activeTextFileType === 'glsl'
    ) {
      const editor = this.props.editor;
      const selection = editor.getSelectionRange();
      const startRange = selection.start;
      const startPosition = editor.renderer.textToScreenCoordinates(startRange);
      const id = this.props.activeTextFileHandWritingFormulaAreaId;
      this.props.incrementHandWritingFormulaAreaId();
      const endTextCoordinate = editor.renderer.pixelToScreenCoordinates(
        startPosition.pageX + this.width,
        startPosition.pageY + this.height
      );
      const textCoordinateWidth = endTextCoordinate.column - startRange.column;
      const textCoordinateHeight = endTextCoordinate.row - startRange.row;
      let word = `/*${id}*/`;
      const num = textCoordinateWidth - word.length;
      for (let i = 0; i < num; i++) {
        word += '\x20';
      }
      for (let i = 0; i < textCoordinateHeight; i++) {
        word += '\n';
        for (let i = 0; i < startRange.column + textCoordinateWidth; i++) {
          word += '\x20';
        }
      }
      editor.insert(word);
      this.props.pushHandWritingFormulaAreas({
        width: this.width,
        height: this.height,
        x: startPosition.pageX,
        y: startPosition.pageY,
        visible: true,
        code: '',
        exchange: false,
        codeEditor: null,
        handWritingFormulaEditor: null,
        glslResultCounter: 0,
        resultVariable: '',
        model: {},
        resizeEvent: false
      });
    }
  };
  handleMouseEnter = () => {
    this.setState({
      backgroundColor: ' rgb(0, 185, 158)',
      fontColor: '#eee'
    });
  };
  handleMouseLeave = () => {
    this.setState({
      backgroundColor: '#eee',
      fontColor: ' rgb(0, 185, 158)'
    });
  };
  render() {
    return (
      <button
      touch-action="auto"
        style={{
          backgroundColor: this.state.backgroundColor,
          color: this.state.fontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        <FaPencilAlt />
      </button>
    );
  }
}
