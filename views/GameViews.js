import React from 'react';
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
      const {myHand} = this.props;
      return(
          <div>
              Your hand is: 
              <br/>{myHand || "Unknown"}
          </div>
      );
  }
}

//Add funcs here
exports.WaitingForResults = class extends React.Component {
  render() {
    return (
      <div>
        Waiting for results...
      </div>
    );
  }
}

exports.Done = class extends React.Component {
  render() {
    const {outcome} = this.props;
    return (
      <div>
        Thank you for playing. The outcome of this game was:
        <br />{outcome || 'Unknown'}
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
      <div>
        There's been a timeout. (Someone took too long.)
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

exports.SeeSum = class extends React.Component{
    render(){
        const {alice,bob} = this.props;
        return(
            <div>
                Sum of Alice's cards: 
                <br/>{alice || "Unknown"}
                <br/> Sum of Bob's cards:
                <br/>{bob || "Unknown"}
            </div>
        );
    }
}

exports.SetGame = class extends React.Component{
    render(){
        const {firstCard, secondCard} = this.props;
        return(
            <div>
            Your cards are: 
            <br/>{ firstCard} 
            , {secondCard}
        </div>
        );
    }
}


export default exports;