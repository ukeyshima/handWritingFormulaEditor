import React from 'react';
import AceEditor from 'react-ace';
import SaveButton from './saveButton.jsx';
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
    this.handleResize = this.handleResize.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.width = window.innerWidth;
  }
  handleResize() {
    let diff = -3;
    this.props.state.renderingObject.forEach(e => {
      diff += 3;
      if (e.type == 'run') {
        diff += 4;
      }
    });
    const per = (window.innerWidth - diff) / (this.width - diff);
    const width = this.props.state.renderingObject[this.props.num].width;
    this.props.state.sizeChange(this.props.num, width * per);
    this.width = window.innerWidth;
    this.editor.resize();
  }
  componentDidMount() {
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
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
  handleChange(e) {
    this.props.state.updateEditorValue(e);
    this.editor.resize();
    if (this.props.state.hotReload) {
      setTimeout(() => {
        this.props.state.updateActiveText(e);
        this.executeHTML();
      }, 15);
    }
  }

  executeHTML() {
    const domParser = new DOMParser();
    let document_obj = null;
    const textFile = this.props.state.textFile;
    try {
      document_obj = domParser.parseFromString(textFile[0].text, 'text/html');
      if (document_obj.getElementsByTagName('parsererror').length) {
        document_obj = null;
      }
    } catch (e) {
      console.log(e);
    }
    if (document_obj) {
      const scripts = document_obj.getElementsByTagName('script');
      const links = document_obj.getElementsByTagName('link');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src) {
          const targetOfJs = textFile.find(e => {
            return (
              e.fileName ===
              scripts[i].src.split('/')[scripts[i].src.split('/').length - 1]
            );
          });

          const blob = new Blob([targetOfJs.text], {
            type: 'application/javascript'
          });
          scripts[i].src = URL.createObjectURL(blob);
        } else {
          const targetOfNotJs = textFile.find(e => {
            return e.fileName === scripts[i].type;
          });
          scripts[i].text = targetOfNotJs.text;
        }
      }
      for (let i = 0; i < links.length; i++) {
        const targetOfCss = textFile.find(e => {
          return (
            e.type === 'css' &&
            links[i].rel === 'stylesheet' &&
            links[i].href.split('/')[links[i].href.split('/').length - 1] ===
              e.fileName
          );
        });
        if (targetOfCss) {
          const blob = new Blob([targetOfCss.text], { type: 'text/css' });
          links[i].href = URL.createObjectURL(blob);
        }
      }
      const blob = new Blob([document_obj.documentElement.outerHTML], {
        type: 'text/html'
      });
      this.props.state.iframeElement.contentWindow.location.replace(
        URL.createObjectURL(blob)
      );
    }
  }

  render() {
    return (
      <AceEditor
        style={this.props.style}
        ref="aceEditor"
        mode={this.props.state.activeTextFile.type}
        theme="dawn"
        onChange={this.handleChange}
        value={this.props.state.editorValue}
        fontSize={27}
        editorProps={{
          $blockScrolling: Infinity
        }}
      />
    );
  }
}
