import React from 'react';
import { inject, observer } from 'mobx-react';
import katex from 'katex';

@inject('state')
@observer
export default class FormulaInCodeRendering extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.state = {
      opacity: 1.0
    };
  }
  componentDidMount() {
    this.refs.canvas.width = this.props.style.width;
    this.refs.canvas.height = this.props.style.height;
    this.context = this.refs.canvas.getContext('2d');
    const img = new Image();
    img.addEventListener('load', () => {
      this.context.drawImage(
        img,
        0,
        0,
        this.props.style.width,
        this.props.style.height
      );
    });
    img.src = this.props.style.backgroundImage;
  }
  handleMouseEnter() {
    this.setState({
      opacity: 0.3
    });
  }
  handleMouseLeave() {
    this.setState({
      opacity: 1.0
    });
  }
  handleClick(e) {
    this.setState({
      opacity: 0.3
    });
  }
  handleDoubleClick() {
    const model = document.getElementById('MODEL-viewTransform');
    const svg = model.parentNode;
    svg.removeChild(model);
    svg.appendChild(this.props.svgElement.cloneNode(true));
    console.log(this.props.state.handWritingFormulaArea);
    console.log(this.props.editor);
    for (var i in this.props.editor) {
      this.props.state.handWritingFormulaArea[i] = this.props.editor[i];
    }
    console.log(this.props.state.handWritingFormulaArea);
    this.props.state.handWritingFormulaArea = this.props.editor;
    // katex.render(this.props.latex, this.props.state.resultElement, {
    //   throwOnError: false
    // });
  }
  render() {
    return (
      <React.Fragment>
        <canvas
          ref="canvas"
          onClick={this.handleClick}
          onDoubleClick={this.handleDoubleClick}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          style={{
            opacity: this.state.opacity,
            width: this.props.style.width,
            height: this.props.style.height,
            position: 'absolute',
            zIndex: 5,
            left: this.props.style.left,
            top: this.props.style.top,
            backgroundColor: '#fff',
            backgroundSize: 'contain',
            border: '#000 solid 1px'
          }}
        />
      </React.Fragment>
    );
  }
}
