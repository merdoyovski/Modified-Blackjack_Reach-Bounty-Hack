import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

const DECK = { 1:'A' , 2:'2', 3:'3', 4:'4', 5:'5', 6:'6', 7:'7', 8:'8', 9:'9', 10:'10', 11:'J', 12:'Q', 13:'K'};
const {standartUnit} = reach;
const intToOutcome = ['Bob wins!', 'Draw!', 'Alice wins!'];
const defaults = {defaultFundAmt: '10', defaultWager: '3', standartUnit};
// Both hands are held in arrays, to be provided in front end.
// opponentHand contains a "hidden" card as the first card is not published.
var opponentHand = [0];
var myHand = [0];


class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {view: 'ConnectAccount', ...defaults};
    }
    async componentDidMount() {
      const acc = await reach.getDefaultAccount();
      const balAtomic = await reach.balanceOf(acc);
      const bal = reach.formatCurrency(balAtomic, 4);
      
      this.setState({view: 'Entry', acc, bal});
    }
    async fundAccount(fundAmount) {
      await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
      this.setState({view: 'DeployerOrAttacher'});
    }
    async skipEntry() { this.setState({view: 'DeployerOrAttacher'}); }
    selectAttacher() { 
      console.log(myHand);
      console.log(opponentHand);
      this.setState({view: 'Wrapper', ContentView: Attacher, yourHand: myHand, enemyHand: opponentHand }); }
    selectDeployer() { 
      console.log(myHand);
      console.log(opponentHand);
      this.setState({view: 'Wrapper', ContentView: Deployer, yourHand: myHand, enemyHand: opponentHand }); }
    render() { return renderView(this, AppViews); }
  }

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'ConnectAccount', ...defaults, myH: [], eH: []};
  }
    random() { return reach.hasRandom.random(); }
    async getCard() { // Fun([], UInt)
      var card = await new Promise(resolveHandP => {
        this.setState({view: 'GetCard', playable: true, resolveHandP});
      });
      card = Math.floor(Math.random() * 12)+1;
      myHand.push(DECK[card]);
      card = (card > 10 ? 10:card);
      this.setState({view: 'WaitingForResults', card});
      return card;
    }
    async setGame() {
        var hands = [];
        for (let index = 0; index < 2; index++) {
            var card = Math.floor(Math.random() * 12)+1;
            myHand.push(DECK[card]);
            hands.push((card>10 ? 10: card));

            //mHand += card ;
        }
        //this.setState({view: 'SetGame',firstCard: myHand[0],secondCard: myHand[1]});
        this.setState({view: 'Wrapper', ContentView: Deployer, yourHand: myHand, enemyHand: opponentHand });
        return [hands[0], hands[1]];
    }
    seeOutcome(i) { this.setState({view: 'Done', outcome: intToOutcome[i]}); }
    informTimeout() { this.setState({view: 'Timeout'}); }
    playHand(i) { this.state.resolveHandP(i ? myHand[myHand.length-1]:0); }// check here
    updateOpponentHand(i) {
        opponentHand.push(DECK[i]);
        console.log("opp hand");
        console.log(DECK[i]);
        console.log("opp hand");
        this.setState({view: 'Wrapper', ContentView: Deployer, yourHand: myHand, enemyHand: opponentHand });
        //this.setState({view: 'SeeHands', myHand: myHand, opponentsHand: opponentHand});
    }
    seeSum(sums) { this.setState({view: 'SeeSum', alice: sums[0], bob: sums[1]});}
  }

  class Deployer extends Player {
    constructor(props) {
      super(props);
      this.state = {view: 'SetWager'};
    }
    setWager(wager) { this.setState({view: 'Deploy', wager}); }
    async deploy() {
      const ctc = this.props.acc.deploy(backend);
      this.setState({view: 'Deploying', ctc});
      this.wager = reach.parseCurrency(this.state.wager); // UInt
      backend.Alice(ctc, this);
      const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
      this.setState({view: 'WaitingForAttacher', ctcInfoStr});
    }
    render() { return renderView(this, DeployerViews); }
  }

  class Attacher extends Player {
    constructor(props) {
      super(props);
      this.state = {view: 'Attach'};
    }
    attach(ctcInfoStr) {
      const ctc = this.props.acc.attach(backend, JSON.parse(ctcInfoStr));
      this.setState({view: 'Attaching'});
      backend.Bob(ctc, this);
    }
    async acceptWager(wagerAtomic) { // Fun([UInt], Null)
      const wager = reach.formatCurrency(wagerAtomic, 4);
      return await new Promise(resolveAcceptedP => {
        this.setState({view: 'AcceptTerms', wager, resolveAcceptedP});
      });
    }
    termsAccepted() {
      this.state.resolveAcceptedP();
      this.setState({view: 'WaitingForTurn'});
    }
    render() { return renderView(this, AttacherViews); }
  }
  
  renderDOM(<App />);