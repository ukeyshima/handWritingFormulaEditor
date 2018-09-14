import React from 'react';
import { inject, observer } from 'mobx-react';
import fs from './demo/fragmentShader.txt';
import vs from './demo/vertexShader.txt';
import js from './demo/main.txt';
import css from './demo/style.txt';
import html from './demo/index.txt';

@inject('state')
@observer
export default class DemoButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontColor: '#000'
    };
  }
  undoStackReset = () => {
    const undoManager = this.props.state.editor.session.$undoManager;
    const undoStack = undoManager.$undoStack.concat();
    const redoStack = undoManager.$redoStack.concat();
    this.props.state.updateActiveUndoStack(undoStack);
    this.props.state.updateActiveRedoStack(redoStack);
    const text = this.props.state.editor.getValue();
    this.props.state.updateActiveText(text);
    this.props.state.editor.setValue('');
    this.props.state.updateEditorValue('');
  };
  handleClick = () => {
    this.props.state.editor.setValue(html);
    this.props.state.updateEditorValue(html);
    this.undoStackReset();
    this.props.state.pushTextFile({
      id: 1,
      type: 'javascript',
      fileName: 'main.js',
      removed: false,
      text: js
    });
    this.undoStackReset();
    this.props.state.pushTextFile({
      id: 2,
      type: 'css',
      fileName: 'main.css',
      removed: false,
      text: css
    });
    this.undoStackReset();
    this.props.state.pushTextFile({
      id: 3,
      type: 'glsl',
      fileName: 'fragmentShader.glsl',
      removed: false,
      text: fs
    });
    this.undoStackReset();
    this.props.state.pushTextFile({
      id: 4,
      type: 'glsl',
      fileName: 'vertexShader.glsl',
      removed: false,
      text: vs
    });
    this.props.state.incrementId();
  };
  handleMouseLeave = () => {
    this.setState({
      fontColor: '#000'
    });
  };
  handleMouseEnter = () => {
    this.setState({
      fontColor: ' rgb(0, 185, 158)'
    });
  };
  render() {
    return (
      <button
        style={{
          color: this.state.fontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        demo
      </button>
    );
  }
}
