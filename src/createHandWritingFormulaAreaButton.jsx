//export to modeSelect.jsx
import React from 'react';
import { inject, observer } from 'mobx-react';
import { FaPencilAlt } from 'react-icons/fa';

@inject('state')
@observer
export default class CreateHandWritingFormulaArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: '#eee',
      fontColor: ' rgb(0, 185, 158)'
    };
  }
  handleClick = () => {
    const editor = this.props.state.editor;
    const selection = editor.getSelectionRange();
    const startRange = selection.start;
    const startPosition = editor.renderer.textToScreenCoordinates(startRange);
    const id = this.props.state.handWritingFormulaAreaId;
    this.props.state.incrementHandWritingFormulaAreaId();
    let word = `/*${id}*/`;
    for (let i = 0; i < 31 - word.length; i++) {
      word += '\x20';
    }
    for (let i = 0; i < 8; i++) {
      word += '\n';
    }
    for (let i = 0; i < startRange.column + 31; i++) {
      word += '\x20';
    }
    editor.insert(word);
    this.props.state.pushHandWritingFormulaAreas({
      width: 500,
      height: 320,
      x: startPosition.pageX,
      y: startPosition.pageY,
      visible: true,
      code: '',
      exchange: false,
      codeEditor: null,
      handwritingFormulaEditor: null
    });
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
