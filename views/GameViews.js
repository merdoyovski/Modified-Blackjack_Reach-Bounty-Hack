/* import React from 'react';
import PlayerViews from './PlayerViews';

const exports = {...PlayerViews};

exports.Wrapper = class extends React.Component {
  render() {
    const {content} = this.props;
    return (
      <div className="Game">
        <h2>HELLOOO</h2>
        {content}
      </div>
    );
  }
}

exports.SeeHands = class extends React.Component{
  render() {
      const {myHand, opponentsHand} = this.props;
      return(
          <div>
              Your hand is: 
              <br/>{myHand || "Unknown"}
              <br/> Opponent hand is:
              <br/>{opponentsHand || "Unknown"}
          </div>
      );
  }
}

exports.Drawing = class extends React.Component{
  render() {
      const {myHand, zz} = this.props;
      return(
          <div>
              Your hand is: 
              <br/>{myHand || "Unknown"}
          </div>
      );
  }
}


export default exports; */