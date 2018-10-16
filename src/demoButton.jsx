import React from 'react';
import { inject, observer } from 'mobx-react';
import fs from './demo/fragmentShader.txt';
import vs from './demo/vertexShader.txt';
import js from './demo/main.txt';
import css from './demo/style.txt';
import html from './demo/index.txt';
import json from './demo/handWritingFormula.json';

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
    const hotReloadFlag = this.props.state.hotReload;
    this.props.state.updateHotReload(false);
    this.props.state.clearTextFile();
    this.undoStackReset();
    this.props.state.pushTextFile({
      id: 0,
      type: 'html',
      fileName: 'index.html',
      removed: false,
      text: html,
      undoStack: null,
      redoStack: null,
      handWritingFormulaAreaId: 0,
      handWritingFormulaAreas: []
    });
    this.undoStackReset();
    this.props.state.pushTextFile({
      id: 1,
      type: 'javascript',
      fileName: 'main.js',
      removed: false,
      text: js,
      undoStack: null,
      redoStack: null,
      handWritingFormulaAreaId: 0,
      handWritingFormulaAreas: []
    });
    this.undoStackReset();
    this.props.state.pushTextFile({
      id: 2,
      type: 'css',
      fileName: 'main.css',
      removed: false,
      text: css,
      undoStack: null,
      redoStack: null,
      handWritingFormulaAreaId: 0,
      handWritingFormulaAreas: []
    });
    this.undoStackReset();
    this.props.state.pushTextFile({
      id: 3,
      type: 'glsl',
      fileName: 'fragmentShader.glsl',
      removed: false,
      text: fs,
      undoStack: null,
      redoStack: null,
      handWritingFormulaAreaId: json.length,
      handWritingFormulaAreas: json
      // handWritingFormulaAreaId: 0,
      // handWritingFormulaAreas: []
    });
    this.undoStackReset();
    this.props.state.pushTextFile({
      id: 4,
      type: 'glsl',
      fileName: 'vertexShader.glsl',
      removed: false,
      text: vs,
      undoStack: null,
      redoStack: null,
      handWritingFormulaAreaId: 0,
      handWritingFormulaAreas: []
    });
    this.props.state.incrementId();
    if (hotReloadFlag) {
      this.props.state.updateHotReload(hotReloadFlag);
      const textFIle = this.props.state.textFile;
      this.props.state.executeHTML(textFIle);
    }
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
