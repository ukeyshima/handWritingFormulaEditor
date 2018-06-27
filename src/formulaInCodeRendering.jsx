import React from "react";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class FormulaInCodeRendering extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseEnter=this.handleMouseEnter.bind(this);
    this.handleMouseLeave=this.handleMouseLeave.bind(this);
    this.state={
      opacity:1.0
    }
  }
  handleMouseEnter(){
    this.setState({
      opacity:0.3
    })
  }
  handleMouseLeave(){
    this.setState({
      opacity:1.0
    })
  }
  render() {
    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={{
          opacity:this.state.opacity,
          width: this.props.style.width,
          height: this.props.style.height,
          position: "absolute",
          zIndex: 5,
          left: this.props.style.left,
          top: this.props.style.top,
          backgroundImage: this.props.style.backgroundImage,
          backgroundColor: "#fff",
          backgroundSize: "contain",
          border:"#000 solid 1px"
        }}
      />
    );
  }
}
