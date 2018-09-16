import React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/html';
import 'brace/mode/javascript';
import 'brace/mode/glsl';
import 'brace/mode/css';
import 'brace/theme/dawn';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight - 110
    };
  }

  handleResize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight - 110
    });
    this.editor.resize();
  };
  componentDidMount = () => {
    const editor = this.refs.aceEditor.editor;
    this.editor = editor;
    editor.resize();
    editor.session.setUseWrapMode(true);
    this.props.state.updateEditor(editor);
    const AceUndoManager = editor.session.$undoManager;
    AceUndoManager.reset();
    this.keyboardHandler = editor.getKeyboardHandler();
    this.keyboardHandler.addCommand({
      name: 'save-event',
      bindKey: { win: 'Ctrl+s', mac: 'Command+s' },
      exec: () => {
        try {
        } catch (e) {
          console.log(e);
        }
      },
      readOnly: true
    });
    window.addEventListener('resize', this.handleResize);
  };
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
  handleChange = e => {
    this.props.state.updateEditorValue(e);
    this.props.state.handWritingFormulaAreas.forEach((e, i) => {
      const searchWord = `/*${i}*/`;
      this.editor.$search.setOptions({ needle: searchWord, regExp: false });
      const range = this.editor.$search.findAll(this.editor.session);
      if (range.length > 0) {
        const position = this.editor.renderer.textToScreenCoordinates(
          range[0].start
        );
        this.props.state.updateHandWritingFormulaAreaAnchor(
          i,
          position.pageX,
          position.pageY
        );
        this.props.state.updateHandWritingFormulaAreaVisible(i, true);
        this.props.state.updateHandWritingFormulaAreaStartRow(
          i,
          range[0].start.row
        );
      } else {
        this.props.state.updateHandWritingFormulaAreaVisible(i, false);
      }
    });
    if (this.props.state.hotReload) {
      this.props.state.updateActiveText(e);
      this.props.state.executeHTML(this.props.state.textFile);
    }
  };

  handleScroll = () => {
    this.props.state.handWritingFormulaAreas.forEach((e, i) => {
      const searchWord = `/*${i}*/`;
      this.editor.$search.setOptions({ needle: searchWord, regExp: false });
      const range = this.editor.$search.findAll(this.editor.session);
      if (range.length > 0) {
        const position = this.editor.renderer.textToScreenCoordinates(
          range[0].start
        );
        this.props.state.updateHandWritingFormulaAreaAnchor(
          i,
          this.props.state.handWritingFormulaAreas[i].x,
          position.pageY
        );
        this.props.state.updateHandWritingFormulaAreaVisible(i, true);
      } else {
        this.props.state.updateHandWritingFormulaAreaVisible(i, false);
      }
    });
  };

  render() {
    return (
      <AceEditor
        style={{
          width: this.state.width,
          height: this.state.height
        }}
        ref="aceEditor"
        mode={this.props.state.activeTextFile.type}
        theme="dawn"
        onChange={this.handleChange}
        onScroll={this.handleScroll}
        value={this.props.state.editorValue}
        fontSize={27}
        editorProps={{
          $blockScrolling: Infinity
        }}
      />
    );
  }
}
