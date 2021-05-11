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

  console.log(`Starting Rock, Paper, Scissors! as ${who}`);

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

  const HAND = ['Rock', 'Paper', 'Scissors'];
  const HANDS = {
    'Rock': 0, 'R': 0, 'r': 0,
    'Paper': 1, 'P': 1, 'p': 1,
    'Scissors': 2, 'S': 2, 's': 2,
  };
  interact.getHand = async () => {
    const hand = await ask(`What hand will you play?`, (x) => {
      const hand = HANDS[x];
      if ( hand == null ) {
        throw Error(`Not a valid hand ${hand}`);
      }
      return hand;
    });
    console.log(`You played ${HAND[hand]}`);
    return hand;
  };

  const CARDS = ['0', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const CHOICE = ['STAND', 'HIT'];
  const CHOICES = {
    'Stand': 0, 's': 0, 'stand': 0, 'S': 0,
    'Hit': 1, 'h': 1, 'hit': 1, 'H': 1
  };
  
  // TODO: Keep track of the players hand via dynamic array
  interact.getCard = async () => {
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
      console.log(`You choose to ${CHOICE[choice]} and draw ${CARDS[card]}`);
      return card;
    }
    else if(choice == 0) 
    {
      console.log(`You choose to ${CHOICE[choice]}`);
      return 0;
    }
  }

  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
  interact.seeOutcome = async (outcome) => {
    console.log(`The outcome is: ${OUTCOME[outcome]}`);
  };
  interact.seeSum = async (outcome) => {
    console.log(`sumA: ${outcome[0]}, sumB: ${outcome[1]}`);
  };

  const part = isAlice ? backend.Alice : backend.Bob;
  await part(ctc, interact);

  const after = await getBalance();
  console.log(`Your balance is now ${after}`);

  done();
})();
