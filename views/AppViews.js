import React from 'react';

const exports = {};

exports.Wrapper = class extends React.Component {
  render() {
    const {content} = this.props;
    return (
      <div className="App">
        <header className="App-header" id="root">
          <h1>Asymetric Blackjack</h1>
          {content}
        </header>
      </div>
    );
  }
}

exports.ConnectAccount = class extends React.Component {
  render() {
    return (
      <div>
        Please wait while we connect to your account.
        If this takes more than a few seconds, there may be something wrong.
      </div>
    )
  }
}

exports.Entry = class extends React.Component {
  render() {
    const {bal, standardUnit, defaultFundAmt, parent} = this.props;
    const amt = (this.state || {}).amt || defaultFundAmt;
    return (
      <div className="Rules">
        <h2>Rules</h2>
        <ul>
              <li>Each player starts with 2 cards, first card is hidden from the other player and others are published.</li>
              <li>The player whose total card values in hand is closest to 21 wins. From either side!</li>
              <li>However, if the value of your hand is greater than 21 then your distance will be multiplied by 2.</li>
              <li>i.e. if A got 20, B got 22: A wins because A is 1 away from 21 but B is (1*2) away from the 21.</li>
              <li>Each player can either choose to HIT or STAND at each round</li>
              <li>The game will end when both players choose to STAND</li>
              <li>You can't count the cards as the game has an infinite supply of each card.</li>
        </ul>
        <br />
        Balance: {bal} {standardUnit}
        <hr />
        <button onClick={() => parent.skipEntry()}>Start the Game</button>
      </div>
    );
  }
}

exports.DeployerOrAttacher = class extends React.Component {
  render() {
    const {parent} = this.props;
    return (
      <div>
        Please select a role:
        <br />
        <p>
          <button
            onClick={() => parent.selectDeployer()}
          >Deployer</button>
          <br /> Set the wager, deploy the contract.
        </p>
        <p>
          <button
            onClick={() => parent.selectAttacher()}
          >Attacher</button>
          <br /> Attach to the Deployer's contract.
        </p>
      </div>
    );
  }
}

export default exports;