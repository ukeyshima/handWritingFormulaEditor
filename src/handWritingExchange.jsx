//export to "renderingObject.jsx"
import React from 'react';
import { inject, observer } from 'mobx-react';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/mode/glsl';

@inject(({ state }, props) => ({
  activeTextFileType: state.textFile[props.textfilenum].type,
  updateHandWritingFormulaAreaCodeEditor:
    state.updateHandWritingFormulaAreaCodeEditor
}))
@observer
export default class HandWritingExchange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: this.props.code,
      mode: 'javascript'
    };
  }
  componentDidMount() {
    const mode = this.props.activeTextFileType;
    this.setState({
      mode: mode
    });
    const editor = this.refs.aceEditor.editor;
    this.props.updateHandWritingFormulaAreaCodeEditor(this.props.num, editor);
  }
  handleChange = e => {
    this.setState({
      code: e
    });
  };
  render() {
    return (
      <div style={this.props.style}>
        <AceEditor
          style={{
            width: this.props.style.width,
            height: this.props.style.height,
            zIndex: 22
          }}
          onChange={this.handleChange}
          ref="aceEditor"
          mode={this.state.mode}
          theme="dawn"
          value={this.state.code}
          fontSize={27}
          editorProps={{
            $blockScrolling: Infinity
          }}
        />
      </div>
    );
  }
}
