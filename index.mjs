import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno, done } from '@reach-sh/stdlib/ask.mjs';

(async () => {
  const stdlib = await loadStdlib();

  const isAlice = await ask(
    `Are you Alice?`,
    yesno
  );
  const who = isAlice ? 'Alice' : 'Bob';

  console.log(`Starting Assymetric Blackjack! as ${who}`);

  let acc = null;
  const createAcc = await ask(
    `Would you like to create an account? (only possible on devnet)`,
    yesno
  );
  if (createAcc) {
    acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
  } else {
    const secret = await ask(
      `What is your account secret?`,
      (x => x)
    );
    acc = await stdlib.newAccountFromSecret(secret);
  }

  let ctc = null;
  const deployCtc = await ask(
    `Do you want to deploy the contract? (y/n)`,
    yesno
  );
  if (deployCtc) {
    ctc = acc.deploy(backend);
    const info = await ctc.getInfo();
    console.log(`The contract is deployed as = ${JSON.stringify(info)}`);
  } else {
    const info = await ask(
      `Please paste the contract information:`,
      JSON.parse
    );
    ctc = acc.attach(backend, info);
  }

  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async () => fmt(await stdlib.balanceOf(acc));

  const before = await getBalance();
  console.log(`Your balance is ${before}`);

  const interact = { ...stdlib.hasRandom };

  interact.informTimeout = () => {
    console.log(`There was a timeout.`);
    process.exit(1);
  };

  if (isAlice) {
    const amt = await ask(
      `How much do you want to wager?`,
      stdlib.parseCurrency
    );
    interact.wager = amt;
  } else {
    interact.acceptWager = async (amt) => {
      const accepted = await ask(
        `Do you accept the wager of ${fmt(amt)}?`,
        yesno
      );
      if (accepted) {
        return;
      } else {
        process.exit(0);
      }
    };
  }

  const CARDS = ['0', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const CHOICE = ['STAND', 'HIT'];
  const CHOICES = {
    'Stand': 0, 's': 0, 'stand': 0, 'S': 0,
    'Hit': 1, 'h': 1, 'hit': 1, 'H': 1
  };
  var opponentHand = new Array("?");
  var yourHand = new Array();

  interact.updateOpponentHand = async (card) => {
      opponentHand.push(CARDS[card]);
  }
  
  // TODO: Keep track of the players hand via dynamic array
  interact.getCard = async () => {

    var hand = "";
 
    yourHand.forEach(element => {
      hand = hand + element + ", "
    });
    console.log(`Your hand: ${hand}`);
    hand = "";
    
    opponentHand.forEach(element => {
      hand = hand + element + ", "
    });
    console.log(`Opponents hand: ${hand}`);

    const choice = await ask(`Will you hit?`, (x) => {
      const choice = CHOICES[x];
      if ( choice == null ) {
        throw Error(`Not a valid choice ${choice}`);
      }
      return choice;
    });

    if(choice == 1)
    {
      const card = Math.floor(Math.random() * 12)+1;
      yourHand.push(CARDS[card]);
      console.log(`You choose to ${CHOICE[choice]} and draw ${CARDS[card]}`);
      if(card > 10)
        card = 10;
      return card;
    }
    else if(choice == 0) 
    {
      console.log(`You choose to ${CHOICE[choice]}`);
      return 0;
    }
  }

  interact.setGame =async () => {
    const card_one = Math.floor(Math.random() * 12)+1;
    const card_two = Math.floor(Math.random() * 12)+1;

    yourHand.push(CARDS[card_one]);
    yourHand.push(CARDS[card_two]);
    console.log(`You draw ${CARDS[card_one]} and ${CARDS[card_two]}`);
    return [card_one, card_two];
  }

  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
  interact.seeOutcome = async (outcome) => {
    console.log(`The outcome is: ${OUTCOME[outcome]}`);
  };
  interact.seeSum = async (sum) => {
    console.log(`sumA: ${sum[0]}, sumB: ${sum[1]}`);
  };
  interact.seeHand = async (hands) =>{
    console.log(`Hand of Alice is : ${hands[0]}, Hand of Bob is ${hands[1]}`);
  } 

  const part = isAlice ? backend.Alice : backend.Bob;
  await part(ctc, interact);

  const after = await getBalance();
  console.log(`Your balance is now ${after}`);

  done();
})();
