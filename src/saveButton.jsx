import React from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
@inject('state')
@observer
export default class SaveButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontColor: '#000'
    };
  }
  download = (data, type) => {
    const e = document.createEvent('MouseEvents');
    e.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
    const a = document.createElement('a');
    a.textContent = 'save';
    a.download =
      type === 'application/json'
        ? 'handWritingFormula.json'
        : this.props.state.activeTextFile.fileName;
    data = type === 'application/json' ? JSON.stringify(data) : data;
    a.href = window.URL.createObjectURL(
      new Blob([data], { type: 'text/plain' })
    );
    a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
    a.dispatchEvent(e);
  };
  handleClick = () => {
    let data = this.props.state.editor.getValue();
    if (this.props.state.activeTextFile.fileName === 'index.html') {
      const domParser = new DOMParser();
      let document_obj = null;
      try {
        document_obj = domParser.parseFromString(
          this.props.state.activeTextFile.text,
          'text/html'
        );
        if (document_obj.getElementsByTagName('parsererror').length) {
          document_obj = null;
        }
      } catch (e) {
        console.log(e);
      }
      if (document_obj) {
        const scripts = document_obj.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          if (scripts[i].type) {
            const textFile = this.props.state.textFile.find(e => {
              return e.fileName === scripts[i].type;
            });
            scripts[i].text = textFile.text;
          }
        }
        data = document_obj.documentElement.outerHTML;
      }
    }
    this.download(data, 'text/plain');
    let data2 = toJS(this.props.state.handWritingFormulaAreas);
    console.log(data2[0].model);
    data2.forEach(e => {
      e.handWritingFormulaEditor = null;
    });
    this.download(data2, 'application/json');
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
        save
      </button>
    );
  }
}
