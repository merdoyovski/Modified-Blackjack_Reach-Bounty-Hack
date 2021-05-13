import React from 'react';

const exports = {};

// Player views must be extended.
// It does not have its own Wrapper view.

exports.Wrapper = class extends React.Component{
  render() {
    const {content} = this.props;
      console.log(this.props.content.props);
      return(
          <div className="Deployer">
              {content}
          </div>
          
      );
  }
}

exports.GetCard = class extends React.Component {
    render() {
      const {parent, playable, hand, yourHand, enemyHand} = this.props;
      return (
        <div>            
              Your hand is: 
              <br/>{yourHand}
              <br/> Opponent hand is:
              <br/>{enemyHand}
          <br />
          {!playable ? 'Please wait...' : ''}
          <br />
          <button
            disabled={!playable}
            onClick={() => parent.playHand(1)}
          >HIT</button>
          <button
            disabled={!playable}
            onClick={() => parent.playHand(0)}
          >STAND</button>
        </div>
      );
    }
  }
//Add funcs here
exports.WaitingForResults = class extends React.Component {
  render() {
      const {yourHand, enemyHand}= this.props;
    return (
      <div>
          Your hand is: 
              <br/>{yourHand}
              <br/> Opponent hand is:
              <br/>{enemyHand}
              <br /> Waiting for results... 
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
        console.log(0);
        console.log(this.props);
        console.log(0);
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