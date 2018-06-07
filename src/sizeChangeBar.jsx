import React from "react";
import ReactDOM from "react-dom";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class SizeChangeBar extends React.Component {
  constructor(props) {
    super(props);    
    this.handleMouseDown=this.handleMouseDown.bind(this);
    this.handleMouseUp=this.handleMouseUp.bind(this);
  }  
  handleMouseDown(){    
      this.props.state.scrolling(this.props.num,true);      
  }
  handleMouseUp(){    
      this.props.state.scrolling(this.props.num,false);            
  }
  render() {
    return (
      <div        
      onMouseDown={this.handleMouseDown}
      onMouseUp={this.handleMouseUp}
        style={{
          width: "3px",
          height: "calc(100vh - 110px)",
          backgroundColor: "#e38",
          float:"left",
          cursor: "col-resize"
        }}
      />
    );
  }
}
