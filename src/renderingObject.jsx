import React from 'react';
import Editor from './editor.jsx';
import SizeChangeBar from './sizeChangeBar.jsx';
import RunFrame from './runFrame.jsx';
import HandWritingFormulaArea from './handWritingFormulaArea.jsx';
import FormulaInCodeRendering from './formulaInCodeRendering.jsx';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class RenderingObject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formulaInCode: []
    };
    this.handleChangeFormulaInCodeAnchor = this.handleChangeFormulaInCodeAnchor.bind(
      this
    );
    this.handleUpdateFormulaInCode = this.handleUpdateFormulaInCode.bind(this);
  }
  componentDidMount() {
    this.props.state.updateUpdateFormulaInCode(this.handleUpdateFormulaInCode);
    this.props.state.updateChangeFormulaInCodeAnchor(
      this.handleChangeFormulaInCodeAnchor
    );
  }
  handleUpdateFormulaInCode(obj) {
    const formulaInCode = this.state.formulaInCode;
    formulaInCode.push(obj);
    this.setState({
      formulaInCode: formulaInCode
    });
    this.props.state.incrementFormulaInCodeId();
  }
  handleChangeFormulaInCodeAnchor(num, x, y, bool) {
    if (!this.props.state.dontExecute) {
      const formulaInCode = this.state.formulaInCode;
      formulaInCode[num].x = x;
      formulaInCode[num].y = y;
      formulaInCode[num].visible = bool;
      this.setState({
        formulaInCode: formulaInCode
      });
    }
  }

  render() {
    const renderingObject = this.props.state.renderingObject;
    return (
      <React.Fragment>
        {renderingObject.map((e, i) => {
          if (e.type === 'editor') {
            return (
              <Editor
                key={i}
                num={i}
                style={{
                  width: Math.floor(e.width),
                  height: window.innerHeight - 110,
                  float: 'left'
                }}
              />
            );
          } else if (e.type === 'run') {
            return (
              <React.Fragment key={i}>
                <SizeChangeBar num={i} />
                <RunFrame
                  num={i}
                  style={{
                    width: Math.floor(e.width),
                    height: window.innerHeight - 110,
                    float: 'left'
                  }}
                />
              </React.Fragment>
            );
          } else if (e.type === 'handWritingFormulaArea') {
            return (
              <React.Fragment key={i}>
                <SizeChangeBar num={i} />
                <HandWritingFormulaArea
                  num={i}
                  style={{
                    width: Math.floor(e.width),
                    height: window.innerHeight - 110,
                    float: 'left',
                    backgroundColor: '#000',
                    color: '#fff'
                  }}
                />
              </React.Fragment>
            );
          }
        })}
        {this.state.formulaInCode.map((e, key) => {
          if (e.visible) {
            return (
              <FormulaInCodeRendering
                key={key}
                style={{
                  width: e.width,
                  height: e.height,
                  top: e.y,
                  left: e.x,
                  backgroundImage: e.url
                }}
                latex={e.latex}
                svgElement={e.svgElement}
                editor={e.editor}
              />
            );
          }
        })}
      </React.Fragment>
    );
  }
}
