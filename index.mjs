import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno, done } from '@reach-sh/stdlib/ask.mjs';

// Testing git
(async () => {
  const stdlib = await loadStdlib();

  console.log(`Starting Asymetric Blackjack!`);
  console.log(`Rules and flow of the game:`);
  console.log(`1) Each player starts with 2 cards, first card is hidden from the other player and others are published.`);
  console.log(`2) The player whose total card values in hand is closest to 21 wins. From either side!`);
  console.log(`   However, if the value of your hand is greater than 21 then your distance will be multiplied by 2.`);
  console.log(`   i.e. if A got 20, B got 22: A wins because A is 1 away from 21 but B is (1*2) away from the 21.`);
  console.log(`3) Each player can either choose to HIT or STAND at each round.`);
  console.log(`4) The game will end when both players choose to STAND.`);
  console.log(`4) You can't count the cards as the game has an infinite supply of each card.`);

  const isAlice = await ask(
    `Are you Alice?`,
    yesno
  );
  const who = isAlice ? 'Alice' : 'Bob';



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
    'Stand': 0, 's': 0, 'stand': 0, 'S': 0, 'n': 0, 'N':0,
    'Hit': 1, 'h': 1, 'hit': 1, 'H': 1, 'y': 1, 'Y':1
  };

  // Both hands are held in arrays, to be provided in front end.
  // opponentHand contains a "hidden" card as the first card is not published.
  var opponentHand = new Array("?");
  var yourHand = new Array();

  interact.updateOpponentHand = async (card) => { 
    // Receive opponent's hand information from the backend
    if(card != 0)
      opponentHand.push(CARDS[card]);
  }
  
  interact.getCard = async () => {
    var hand = "";
 
    yourHand.forEach(element => { 
      hand = hand + element + ", " // To concatonate the string and print in one line
    });
    console.log(`Your hand: ${hand}`);
    hand = "";
    
    opponentHand.forEach(element => {
      hand = hand + element + ", "
    });
    console.log(`Opponents hand: ${hand}`);

    const choice = await ask(`Hit or Stand?`, (x) => {
      const choice = CHOICES[x];
      if ( choice == null ) {
        throw Error(`Not a valid choice ${choice}`);
      }
      return choice;
    });

    if(choice == 1) // HIT
    {
      var card = Math.floor(Math.random() * 12)+1;
      yourHand.push(CARDS[card]);
      console.log(`You choose to ${CHOICE[choice]} and draw ${CARDS[card]}`);
      if(card > 10)
        card = 10;
      return card;
    }
    else if(choice == 0) // STAND
    {
      console.log(`You choose to ${CHOICE[choice]}`);
      return 0;
    }
  }

  interact.setGame =async () => { 
    // Initial card distributions
    const card_one = Math.floor(Math.random() * 12)+1;
    const card_two = Math.floor(Math.random() * 12)+1;

    yourHand.push(CARDS[card_one]);
    yourHand.push(CARDS[card_two]);
    console.log(`You draw ${CARDS[card_one]} and ${CARDS[card_two]}`);
    return [card_one, card_two];
  }

  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
  interact.seeOutcome = async (outcome) => { 
    // Prints the result
    console.log(`The outcome is: ${OUTCOME[outcome]}`);
  };

  interact.seeSum = async (sum) => { 
    // Prints the total sum of each players hands
    console.log(`sumA: ${sum[0]}, sumB: ${sum[1]}`);
  };

  const part = isAlice ? backend.Alice : backend.Bob;
  await part(ctc, interact);

  const after = await getBalance();
  console.log(`Your balance is now ${after}`);

  done();
})();
