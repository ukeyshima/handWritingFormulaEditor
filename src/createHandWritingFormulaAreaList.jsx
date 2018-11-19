import React from 'react';
import { inject, observer } from 'mobx-react';
import { FaList } from 'react-icons/fa';

@inject(({ state }) => ({
  updateListButton: state.updateListButton,
  updateListButtonColor: state.updateListButtonColor,
  listButtonColorBackgroundColor: state.listButtonColor.backgroundColor,
  listButtonColorFontColor: state.listButtonColor.fontColor,
  updateListAreaRenderingFlag: state.updateListAreaRenderingFlag,
  listAreaRenderingFlag: state.listAreaRenderingFlag
}))
@observer
export default class CreateHandWritingFormulaAreaList extends React.Component {
  componentDidMount() {
    this.props.updateListButton(this.refs.listButton);
  }
  handleClick = () => {
    this.props.listAreaRenderingFlag
      ? this.props.updateListAreaRenderingFlag(false)
      : this.props.updateListAreaRenderingFlag(true);
  };
  handleMouseEnter = () => {
    this.props.updateListButtonColor({
      backgroundColor: ' rgb(0, 185, 158)',
      fontColor: '#eee'
    });
  };
  handleMouseLeave = () => {
    if (!this.props.listAreaRenderingFlag) {
      this.props.updateListButtonColor({
        backgroundColor: '#eee',
        fontColor: ' rgb(0, 185, 158)'
      });
    }
  };
  render() {
    return (
      <button
        touch-action="auto"
        ref="listButton"
        style={{
          backgroundColor: this.props.listButtonColorBackgroundColor,
          color: this.props.listButtonColorFontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        <FaList />
      </button>
    );
  }
}
