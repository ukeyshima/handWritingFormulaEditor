//export to "renderingObject.jsx"
import React from 'react';
import { inject, observer } from 'mobx-react';
import * as MyScriptJS from 'myscript';
import 'myscript/dist/myscript.min.css';
import latexToJs from './latexToJs';
import latexToGlsl from './latexToGlsl';
import 'katex/dist/katex.min.css';
import { FaReply } from 'react-icons/fa';
import { FaShare } from 'react-icons/fa';
import { FaSyncAlt } from 'react-icons/fa';
import { FaPlayCircle } from 'react-icons/fa';

@inject('state')
@observer
export default class HandWritingFormulaArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      autoConvert: false
    };
  }
  componentDidMount() {
    this.editor = MyScriptJS.register(this.refs.editor, {
      recognitionParams: {
        type: 'MATH',
        protocol: 'WEBSOCKET',
        apiVersion: 'V4',
        server: {
          scheme: 'https',
          host: 'webdemoapi.myscript.com',
          applicationKey: '331b4bdf-7ace-4265-94f1-b01504c78743',
          hmacKey: '44f4f4ce-fd0f-48a1-b517-65d2b9465413'
        },
        v4: {
          math: {
            mimeTypes: ['application/x-latex'],
            solver: {
              enable: false
            }
          },
          text: {
            guides: {
              enable: false
            },
            smartGuide: false
          }
        }
      }
    });
    this.props.state.updateHandWritingFormulaAreaHandWritingFormulaEditor(
      this.props.num,
      this.editor
    );
    const convertElement = this.refs.convert;
    this.editor.export_('image/png');
    this.refs.editor.addEventListener('exported', e => {
      if (this.state.autoConvert) this.editor.convert();
      const exports = e.detail.exports;
      if (exports && exports['application/x-latex']) {
        convertElement.disabled = false;
        const cleanedLatex = this.cleanLatex(exports['application/x-latex']);
        const editorValue = this.props.state.editorValue;
        const splitText = editorValue.split(`/*${this.props.num}*/`)[0];
        const jsSplit = splitText.split('{');
        let jsCode = jsSplit[jsSplit.length - 1];
        const areas = this.props.state.handWritingFormulaAreas;
        for (let i = 0; i < areas.length; i++) {
          jsCode = jsCode.replace(`/*${i}*/`, areas[i].code);
        }
        if (this.props.state.activeTextFile.type === 'javascript') {
          console.log(cleanedLatex);
          this.props.state.updateHandWritingFormulaAreaCode(
            this.props.num,
            latexToJs(cleanedLatex, jsCode)
          );
        } else {
          let glslCode = (() => {
            if (splitText.match(/void main(void)/)) {
              return `${splitText}}`;
            } else if (splitText.split('}').length < jsSplit.length) {
              const func = splitText.match(
                /(float|vec\d|mat\d) [a-zA-Z\d]+\(.*\)\{/g
              );
              const splitfuncText = splitText.split(func[func.length - 1]);
              return `${splitfuncText[0]}
                void main(void){
                  ${func[func.length - 1]
                    .match(/\(.*\)/)[0]
                    .replace('(', '')
                    .replace(')', '')
                    .replace(/\,/g, ';')};
                  ${splitfuncText[1]}
                }`;
            } else {
              return `${splitText}
                void main(void){}`;
            }
          })();
          const areas = this.props.state.handWritingFormulaAreas;
          for (let i = 0; i < areas.length; i++) {
            glslCode = glslCode.replace(`/*${i}*/`, areas[i].code);
          }
          this.props.state.updateHandWritingFormulaAreaCode(
            this.props.num,
            latexToGlsl(cleanedLatex, glslCode)
          );
        }
      } else if (exports && exports['application/mathml+xml']) {
        convertElement.disabled = false;
      } else if (exports && exports['application/mathofficeXML']) {
        convertElement.disabled = false;
      } else {
        convertElement.disabled = true;
      }
    });
  }
  cleanLatex = latexExport => {
    if (latexExport.includes('\\\\')) {
      const steps = '\\begin{align*}' + latexExport + '\\end{align*}';
      return steps
        .replace('\\overrightarrow', '\\vec')
        .replace('\\begin{aligned}', '')
        .replace('\\end{aligned}', '')
        .replace('\\llbracket', '\\lbracket')
        .replace('\\rrbracket', '\\rbracket')
        .replace('\\widehat', '\\hat')
        .replace(new RegExp('(align.{1})', 'g'), 'aligned');
    }
    return latexExport
      .replace('\\overrightarrow', '\\vec')
      .replace('\\llbracket', '\\lbracket')
      .replace('\\rrbracket', '\\rbracket')
      .replace('\\widehat', '\\hat')
      .replace(new RegExp('(align.{1})', 'g'), 'aligned');
  };
  handleConvert = () => {
    this.editor.convert();
  };
  handleClear = () => {
    this.editor.clear();
  };
  handleUndo = () => {
    this.editor.undo();
  };
  handleRedo = () => {
    this.editor.redo();
  };
  handleAutoConvert = () => {
    const bool = this.state.autoConvert;
    this.setState({
      autoConvert: !bool
    });
  };
  render() {
    return (
      <div
        style={this.props.style}
        ref="handWritingFormulaArea"
        id="handWritingFormulaArea"
      >
        <button
          className="handWritingFormulaAreaButton"
          id="clearButton"
          ref="clear"
          onClick={this.handleClear}
        >
          C
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="undoButton"
          ref="undo"
          onClick={this.handleUndo}
        >
          <FaReply />
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="redoButton"
          ref="redo"
          onClick={this.handleRedo}
        >
          <FaShare />
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="convertButton"
          ref="convert"
          onClick={this.handleConvert}
        >
          <FaSyncAlt />
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="autoConvertButton"
          ref="autoConvert"
          onClick={this.handleAutoConvert}
          style={{
            backgroundColor: this.state.autoConvert
              ? '#fff'
              : 'rgb(0, 185, 158)',
            color: this.state.autoConvert ? 'rgb(0,185,158)' : '#fff'
          }}
        >
          <FaPlayCircle />
        </button>
        <div
          id="handWritingFormulaEditor"
          ref="editor"
          touch-action="none"
          style={{
            height: this.props.style.height,
            width: this.props.style.width
          }}
        />
      </div>
    );
  }
}
