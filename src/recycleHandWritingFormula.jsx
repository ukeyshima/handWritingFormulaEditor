import React from 'react';
import { inject, observer } from 'mobx-react';
import { FaRecycle } from 'react-icons/fa';

@inject(({ state }) => ({
  updateRecycleButton: state.updateRecycleButton,
  updateRecycleButtonColor: state.updateRecycleButtonColor,
  recycleButtonColorBackgroundColor: state.recycleButtonColor.backgroundColor,
  recycleButtonColorFontColor: state.recycleButtonColor.fontColor,
  editor: state.editor,
  textFileHandWritingFormulaAreas: state.activeTextFile.handWritingFormulaAreas
}))
@observer
export default class CreateHandWritingFormulaAreaList extends React.Component {
  componentDidMount() {
    this.props.updateRecycleButton(this.refs.recycleButton);
  }
  handleClick = () => {
    const range = this.props.editor.getSelectionRange();
    const text = this.props.editor.session.getTextRange(range);
    const element = this.props.textFileHandWritingFormulaAreas.find(
      e => !e.visible && e.code === text
    );
    const word = element !== undefined ? element.backgroundWord : text;
    this.props.editor.insert(word);
  };
  handleMouseEnter = () => {
    this.props.updateRecycleButtonColor({
      backgroundColor: ' rgb(0, 185, 158)',
      fontColor: '#eee'
    });
  };
  handleMouseLeave = () => {
    this.props.updateRecycleButtonColor({
      backgroundColor: '#eee',
      fontColor: ' rgb(0, 185, 158)'
    });
  };
  render() {
    return (
      <button
        touch-action="auto"
        ref="recycleButton"
        style={{
          backgroundColor: this.props.recycleButtonColorBackgroundColor,
          color: this.props.recycleButtonColorFontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        <FaRecycle />
      </button>
    );
  }
}
