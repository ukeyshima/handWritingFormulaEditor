//export to "renderingObject"
import React from 'react';
import { inject, observer } from 'mobx-react';

@inject(({ state }, props) => ({
  textFileHandWritingFormulaAreas: state.activeTextFile.handWritingFormulaAreas,
  editor: state.editor
}))
@observer
export default class ListArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: window.innerHeight - 110
    };
  }
  handleClick = word => {
    const editor = this.props.editor;
    console.log(word);
    editor.insert(word);
  };
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: 110,
          right: 0,
          backgroundColor: '#ddd',
          width: 300,
          height: this.state.height,
          zIndex: 20,
          overflow: 'auto'
        }}
      >
        {this.props.textFileHandWritingFormulaAreas.map((e, i) => {
          return (
            !e.visible && (
              <img
                onClick={() => this.handleClick(e.backgroundWord)}
                key={i * 100}
                src={(() => {
                  const svgData = new XMLSerializer().serializeToString(
                    e.handWritingFormulaEditor.domElement.children[
                      e.handWritingFormulaEditor.domElement.children.length - 1
                    ]
                  );
                  return (
                    'data:image/svg+xml;charset=utf-8;base64,' + btoa(svgData)
                  );
                })()}
                style={{
                  backgroundColor: '#fff',
                  height: 200
                }}
              />
            )
          );
        })}
      </div>
    );
  }
}
