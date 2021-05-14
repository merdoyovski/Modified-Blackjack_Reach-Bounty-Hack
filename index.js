import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import { renderDOM, renderView } from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

const DECK = { 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K' };
const { standartUnit } = reach;
const intToOutcome = ['Bob wins!', 'Draw!', 'Alice wins!'];
const defaults = { defaultFundAmt: '10', defaultWager: '3', standartUnit };
// Both hands are held in arrays, to be provided in front end.
// opponentHand contains a "hidden" card as the first card is not published.
var opponentHand = ["?"];
var myHand = [];

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function getHandValue(hand){
  var sum = 0;
  hand.forEach(element => {
    var value = parseInt(getKeyByValue(DECK, element));
    console.log("Hand values by card: ");
    console.log(value);
    console.log(typeof value);
    value = value > 10 ? 10 : value;
    sum += value;
    console.log(sum);
    console.log(typeof sum);
  });
  return sum;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: 'ConnectAccount', ...defaults };
  }
  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);

    this.setState({ view: 'Entry', acc, bal });
  }
  async fundAccount(fundAmount) {
    await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({ view: 'DeployerOrAttacher' });
  }
  async skipEntry() { this.setState({ view: 'DeployerOrAttacher' }); }
  selectAttacher() {
    console.log(myHand);
    console.log(opponentHand);
    this.setState({ view: 'Wrapper', ContentView: Attacher });
  }
  selectDeployer() {
    console.log(myHand);
    console.log(opponentHand);
    this.setState({ view: 'Wrapper', ContentView: Deployer });
  }
  render() { return renderView(this, AppViews); }
}

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: 'ConnectAccount', ...defaults, isFirst: true };
  }
  random() { return reach.hasRandom.random(); }
  async getCard() { // Fun([], UInt)

    var card = await new Promise(resolveHandP => {
      this.setState({ view: 'GetCard', playable: true, resolveHandP, yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), waitForOpp: false, dealCards: false, getOpp: false, publishYourCard: false, getResults: false});
    });
    if (card === 1) {
      card = Math.floor(Math.random() * 12) + 1;
      myHand.push(DECK[card]);

      //card = (card > 10 ? 10 : card);
      this.setState({ view: 'GetCard', yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), playable: false, waitForOpp: true, dealCards: false, getOpp: false, publishYourCard: false, getResults: false});
      return card;
    }
    else {
      this.setState({ view: 'GetCard', yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), playable: false,  waitForOpp: true, dealCards: false, getOpp: false, publishYourCard: false, getResults: false});
      return 0;
    }
  }
 
  async setGame() {
    var hands = [];
    for (let index = 0; index < 2; index++) {
      var card = Math.floor(Math.random() * 12) + 1;

      myHand.push(DECK[card]);
      hands.push(card);
    }

    this.setState({ view: 'GetCard', playable: false, yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "),  waitForOpp: false, dealCards: true, getOpp: false, publishYourCard: false, getResults: false});
    return [hands[0], hands[1]];
  }
  async seeOutcome(i) {

    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const balance = reach.formatCurrency(balAtomic, 4);
    const sumA = getHandValue(myHand);
    const sumB = getHandValue(opponentHand);
    this.setState({ view: 'Done', outcome: intToOutcome[i], yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), bal: balance, standartUnit: defaults[2], sumA, sumB });
  }
  informTimeout() { this.setState({ view: 'Timeout' }); }
  playHand(i) {
    this.state.resolveHandP(i ? 1 : 0);
  }// check here
  updateOpponentHand(i) {
    if (i != 0) {
      opponentHand.push(DECK[i]);
    }
    this.setState({ view: 'GetCard', yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), playable: false,  waitForOpp: true, dealCards: false, getOpp: false, publishYourCard: false, getResults: false});
  }
  seeSum(sums) {
 /*    console.log("Type of sums is:");
    console.log(typeof sums);
    console.log(sums); // todo THis. also bugs in hand formatting.
    console.log(Object.keys(sums)); 
    const resultObj = Object.values(sums)
    const resultInt = [resultObj[0], resultObj[1]];
    this.setState({ view: 'SeeSum', sum: resultInt }); */
  }
  revelLastCard(card) {
    opponentHand[0] = DECK[card];
  }
  getResultView(){
    this.setState({ view: 'GetCard', yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), playable: false,  waitForOpp: false, dealCards: false, getOpp: false, publishYourCard: false, getResults: true});
  }
}

class Deployer extends Player {
  constructor(props) {
    super(props);
    this.state = { view: 'SetWager' };
  }
  setWager(wager) { this.setState({ view: 'Deploy', wager }); }
  async deploy() {
    const ctc = this.props.acc.deploy(backend);
    this.setState({ view: 'Deploying', ctc });
    this.wager = reach.parseCurrency(this.state.wager); // UInt
    backend.Alice(ctc, this);
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({ view: 'WaitingForAttacher', ctcInfoStr });
  }
  render() { return renderView(this, DeployerViews); }
}

class Attacher extends Player {
  constructor(props) {
    super(props);
    this.state = { view: 'Attach' };
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.attach(backend, JSON.parse(ctcInfoStr));
    this.setState({ view: 'Attaching' });
    backend.Bob(ctc, this);
  }
  async acceptWager(wagerAtomic) { // Fun([UInt], Null)
    const wager = reach.formatCurrency(wagerAtomic, 4);
    return await new Promise(resolveAcceptedP => {
      this.setState({ view: 'AcceptTerms', wager, resolveAcceptedP });
    });
  }
  termsAccepted() {
    this.state.resolveAcceptedP();
    this.setState({ view: 'WaitingForTurn' });
  }
  render() { return renderView(this, AttacherViews); }
}

renderDOM(<App />);