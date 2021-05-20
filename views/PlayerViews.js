import React from 'react';

const exports = {};

exports.Wrapper = class extends React.Component{
  render() {
    const {content} = this.props;
      return(
          <div className="Deployer">
            {content}   
          </div>    
      );
  }
}

exports.GetCard = class extends React.Component {
    render() {
      const {parent, playable, yourHand, enemyHand, waitForOpp, dealCards, getOpp, publishYourCard, getResults} = this.props;
      return (
        <div className="Game">            
              Your hand is: 
              <br/>{yourHand}
              <br/> Opponent hand is:
              <br/>{enemyHand}
          <br />
          {(waitForOpp ? "Waiting for your opponents move": 
          (dealCards ? "Dealing the cards...": 
          (getOpp ? "Getting opponent cards": 
          (publishYourCard? "Publishing your cards":
          (getResults ? "Game is over. Getting the results.":
          "Make your choice")))))}
          <br/>
          <button className="Hit"
            disabled={!playable}
            onClick={() => parent.playHand(1)}
          >HIT</button>
          <button className="Stand"
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
        <div className="Game"> 
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
    const {yourHand, enemyHand, bal, standardUnit, sumA, sumB}= this.props;
    return (
        <div className="Game"> 
               Your hand is: 
              <br/>{yourHand}
              <br/> Opponent hand is:
              <br/>{enemyHand}
              <br /> 
        <br />{outcome || 'Unknown'}
        <br />
        <br />
        Sum of your cards: 
                <br/>{sumA || "Unknown"}
                <br/> Sum of opponents cards:
                <br/>{sumB  || "Unknown"}
        <br />
        <br />
        Balance: {bal} {standardUnit}
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
        <div className="Game"> 
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}

exports.SeeHands = class extends React.Component{
    render() {
        const {myHand, opponentsHand} = this.props;
        return(
            <div className="Game"> 
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
        const {sum} = this.props;
        return(
            <div className="Game"> 
                Sum of Alice's cards: 
                <br/>{sum[0] || "Unknown"}
                <br/> Sum of Bob's cards:
                <br/>{sum[1]  || "Unknown"}
            </div>
        );
    }
}

exports.SetGame = class extends React.Component{
    render(){
        const {firstCard, secondCard} = this.props;
        return(
            <div className="Game"> 
            Your cards are: 
            <br/>{ firstCard} 
            , {secondCard}
        </div>
        );
    }
}

export default exports;