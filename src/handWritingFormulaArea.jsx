//export to "renderingObject.jsx"
import React from 'react';
import { inject, observer } from 'mobx-react';
import * as MyScriptJS from 'myscript/dist/myscript.esm.js';
import 'myscript/dist/myscript.min.css';
import latexToJs from './latexToJs';
import latexToGlsl from './latexToGlsl';
import 'katex/dist/katex.min.css';
import { FaReply } from 'react-icons/fa';
import { FaShare } from 'react-icons/fa';
import { FaSyncAlt } from 'react-icons/fa';
import { FaPlayCircle } from 'react-icons/fa';

@inject(({ state }, props) => {
  return {
    updateHandWritingFormulaAreaHandWritingFormulaEditor:
      state.updateHandWritingFormulaAreaHandWritingFormulaEditor,
    applicationKey: state.key.applicationKey,
    hmacKey: state.key.hmacKey,
    keyChange: state.keyChange,
    editor: state.editor,
    editorValue: state.activeTextFile.text,
    activeTextFileHandWritingFormulaAreas:
      state.textFile[props.textfilenum].handWritingFormulaAreas,
    updateHandWritingFormulaAreaCode: state.updateHandWritingFormulaAreaCode,
    updateHandWritingFormulaAreaCounter:
      state.updateHandWritingFormulaAreaCounter,
    updateHandWritingFormulaAreaResultVariable:
      state.updateHandWritingFormulaAreaResultVariable,
    updateHandWritingFormulaAreaCode: state.updateHandWritingFormulaAreaCode,
    resultVariable:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num]
        .resultVariable,
    activeTextFileType: state.textFile[props.textfilenum].type
  };
})
@observer
export default class HandWritingFormulaArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      autoConvert: false
    };
  }
  componentWillUnmount() {
    this.refs.editor.removeEventListener('error', this.errorFunc);
    this.refs.editor.removeEventListener('exported', this.exportFunc);
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
          applicationKey: this.props.applicationKey,
          hmacKey: this.props.hmacKey
        },
        v4: {
          math: {
            mimeTypes: ['application/x-latex'],
            // mimeTypes: ['application/vnd.myscript.jiix'],
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
    this.props.updateHandWritingFormulaAreaHandWritingFormulaEditor(
      this.props.num,
      this.editor
    );

    // this.refs.editor.addEventListener('loaded', () => {
    //   if (Object.keys(this.props.model).length > 0) {
    //     const pointerEventsObject = {
    //       events: this.props.model.rawStrokes.slice().map(e => {
    //         const e2 = Object.assign({}, e);
    //         delete e2.l;
    //         delete e2.type;
    //         delete e2.width;
    //         delete e2.color;
    //         delete e2['-myscript-pen-width'];
    //         delete e2['-myscript-pen-fill-style'];
    //         delete e2['-myscript-pen-fill-color'];
    //         return e2;
    //       })
    //     };
    //     this.editor.pointerEvents(
    //       pointerEventsObject,
    //       this.props.model.rawStrokes.length,
    //       true
    //     );
    //     // console.log(JSON.stringify(pointerEventsObject));
    //     // const pointerEventsObjects = this.props.model.rawStrokes
    //     //   .slice()
    //     //   .map(e => {
    //     //     const e2 = Object.assign({}, e);
    //     //     delete e2.l;
    //     //     delete e2.type;
    //     //     delete e2.width;
    //     //     delete e2.color;
    //     //     delete e2['-myscript-pen-width'];
    //     //     delete e2['-myscript-pen-fill-style'];
    //     //     delete e2['-myscript-pen-fill-color'];
    //     //     return { events: [e2] };
    //     //   });
    //     // pointerEventsObjects.reduce(
    //     //   (prev, cur, i) =>
    //     //     prev.then(
    //     //       () =>
    //     //         new Promise(resolve =>
    //     //           setTimeout(() => {
    //     //             this.editor.pointerEvents(pointerEventsObjects[i], true);
    //     //             // console.log(this.editor.eastereggs.inkImporter());
    //     //             resolve();
    //     //             this.editor.export_();
    //     //           }, 1000)
    //     //         )
    //     //     ),
    //     //   Promise.resolve()
    //     // );

    //     for (let e in this.editor.model) {
    //       this.editor.model[e] = this.props.model[e];
    //     }
    //   }
    // });
    this.refs.editor.addEventListener('error', this.errorFunc);
    this.refs.editor.addEventListener('exported', this.exportFunc);
  }
  errorFunc = e => {
    console.log(e);
    const errorElements = document.getElementsByClassName('error-msg');
    while (errorElements.length > 0) {
      errorElements[0].parentNode.removeChild(errorElements[0]);
    }
    this.props.keyChange();
  };
  exportFunc = e => {
    const convertElement = this.refs.convert;
    if (this.state.autoConvert) this.editor.convert();
    const exports = e.detail.exports;
    if (exports && exports['application/x-latex']) {
      convertElement.disabled = false;
      // this.props.state.updateHandWritingFormulaAreaModel(
      //   this.props.num,
      //   this.editor.model
      // );
      const cleanedLatex = this.cleanLatex(exports['application/x-latex']);
      const editorValue = this.props.editorValue;
      const splitText = editorValue.split(`/*${this.props.num}*/`)[0];
      const jsSplit = splitText.split('{');
      if (this.props.activeTextFileType === 'javascript') {
        let jsCode = editorValue;
        const areas = this.props.activeTextFileHandWritingFormulaAreas;
        for (let i = 0; i < areas.length; i++) {
          if (i !== this.props.num) {
            jsCode = jsCode.replace(`/*${i}*/`, areas[i].code);
          }
        }
        // console.log(jsCode);
        this.props.updateHandWritingFormulaAreaCode(
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
        const areas = this.props.activeTextFileHandWritingFormulaAreas;
        for (let i = 0; i < areas.length; i++) {
          glslCode = glslCode.replace(`/*${i}*/`, areas[i].code);
        }
        const resultCounter =
          areas.length > 1 ? areas[this.props.num - 1].glslResultCounter : 0;
        const latex2glsl = latexToGlsl(cleanedLatex, glslCode, resultCounter);
        this.props.updateHandWritingFormulaAreaCounter(
          this.props.num,
          latex2glsl.count
        );
        if (resultCounter !== latex2glsl.count) {
          this.props.updateHandWritingFormulaAreaResultVariable(
            this.props.num,
            latex2glsl.variable
          );
        } else {
          this.props.updateHandWritingFormulaAreaResultVariable(
            this.props.num,
            ''
          );
        }
        console.log(latex2glsl.code);
        this.props.updateHandWritingFormulaAreaCode(
          this.props.num,
          latex2glsl.code
        );
      }
    } else if (exports && exports['application/mathml+xml']) {
      convertElement.disabled = false;
    } else if (exports && exports['application/mathofficeXML']) {
      convertElement.disabled = false;
    } else {
      convertElement.disabled = true;
    }
  };

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
  handleDelete = () => {
    const editor = this.props.editor;
    const searchWord = this.props.editorValue.match(
      new RegExp(`/\\*${this.props.num}\\*/[\\n\\s]*`)
    )[0];
    editor.$search.setOptions({
      needle: searchWord,
      regExp: false
    });
    const range = editor.$search.find(editor.session);
    editor.session.replace(range, '');
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
        <div id="resultVariableView">{this.props.resultVariable}</div>
        <button
          touch-action="auto"
          className="handWritingFormulaAreaButton"
          id="deleteButton"
          ref="delete"
          onClick={this.handleDelete}
        >
          D
        </button>
        <button
          touch-action="auto"
          className="handWritingFormulaAreaButton"
          id="clearButton"
          ref="clear"
          onClick={this.handleClear}
        >
          C
        </button>
        <button
          touch-action="auto"
          className="handWritingFormulaAreaButton"
          id="undoButton"
          ref="undo"
          onClick={this.handleUndo}
        >
          <FaReply />
        </button>
        <button
          touch-action="auto"
          className="handWritingFormulaAreaButton"
          id="redoButton"
          ref="redo"
          onClick={this.handleRedo}
        >
          <FaShare />
        </button>
        <button
          touch-action="auto"
          className="handWritingFormulaAreaButton"
          id="convertButton"
          ref="convert"
          onClick={this.handleConvert}
        >
          <FaSyncAlt />
        </button>
        {/* <button
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
        </button> */}
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
