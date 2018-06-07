import React from "react";
import ReactDOM from "react-dom";
import AddButton from "./addButton.jsx";
import { inject, observer } from "mobx-react";
import TextFileButton from "./textFileButton.jsx";

@inject("state")
@observer
export default class Tab extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id="tab">
        <AddButton />
        {this.props.state.textFile.map((e,i,a) => {                    
          return <TextFileButton key={i} fileName={e.fileName}/>
        })}
      </div>
    );
  }
}
