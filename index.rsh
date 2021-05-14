'reach 0.1';

const winner = (distA, distB) =>
   (distA<distB ? 2:(distB<distA ? 0:1))
  
const Player =
{
  ...hasRandom,
  getCard: Fun([], UInt), // Get a random card from the front end
  seeOutcome: Fun([UInt], Null), // Print the outcome of the game
  seeSum: Fun([Tuple(UInt,UInt)], Null), // Total sum of each players hands
  updateOpponentHand: Fun([UInt], Null), // Send opponent's hand information to the frontend
  informTimeout: Fun([], Null),
  setGame : Fun([],Tuple(UInt,UInt)) // Initial card distributions
};

const Alice =
{
  ...Player,
  wager: UInt
};
const Bob =
{
  ...Player,
  acceptWager: Fun([UInt], Null)
};

const DEADLINE = 10;
export const main =
  Reach.App(
    {},
    [Participant('Alice', Alice), Participant('Bob', Bob)],
    (A, B) => {
      const informTimeout = () => {
        each([A, B], () => {
          interact.informTimeout();
        });
      };

      A.only(() => { // Alice pays and publishes the wager
        const wager = declassify(interact.wager);
      });
      A.publish(wager).pay(wager);
      commit();

      B.only(() => { // Bob pays the wager
        interact.acceptWager(wager);
      });
      B.pay(wager).timeout(DEADLINE, () => closeTo(A, informTimeout));
      commit();

      A.only(() => { // Alice draws 2 cards, hides 1 and publishes 1.
        const [_handA_First, _handA_Second] = interact.setGame();
        const [_commitA, _saltA] = makeCommitment(interact, _handA_First);
        const commitA = declassify(_commitA);
        const handA_Second  = declassify(_handA_Second);
      });
      A.publish(commitA, handA_Second).timeout(DEADLINE, () => closeTo(B, informTimeout));
      commit();

      
       
      B.only(() => { // Bob draws 2 cards, hides 1 and publishes 1.
        const [_handB_First, _handB_Second] = interact.setGame();
        const [_commitB, _saltB] = makeCommitment(interact, _handB_First);
        const commitB = declassify(_commitB);
        const handB_Second  = declassify(_handB_Second);
      });
      B.publish(commitB, handB_Second).timeout(DEADLINE, () => closeTo(A, informTimeout));
   
      A.only(() => { // Alice updates front end with opponents published hand
        interact.updateOpponentHand(handB_Second);
      });

      B.only(() => { // Bob updates front end with opponents published hand
        interact.updateOpponentHand(handA_Second);
      });

      /* ******************************** Game Loop Starts ********************************
         getCard(): asks for HIT or STAND. HIT gives a random card, STAND gives 0.
         Choosing STAND as an answer to getCard results in getting 0 thus isOn becomes 0.
         Loop ends when both players choose to STAND at the same turn.
         sumA: Whenever Alice draws a card, it is added to the sum to calculate the winner at the end.
      */
      var [isOnA, isOnB, sumA, sumB] = [1, 1, handA_Second, handB_Second];
      invariant(balance() == 2 * wager);
      while (isOnA > 0 || isOnB > 0) {
        commit();

        A.only(() => { // Choose whether to HIT or STAND
          const cardA = declassify(interact.getCard());
        });
        A.publish(cardA).timeout(DEADLINE, () => closeTo(B, informTimeout));
        commit();
        const cardA_value = (cardA>10 ? 10: cardA);

        B.only(() => { // Bob updates front end again
          interact.updateOpponentHand(cardA_value);
        });

        
        B.only(() => {
          const cardB = declassify(interact.getCard());
        });
        B.publish(cardB).timeout(DEADLINE, () => closeTo(A, informTimeout));
        const cardB_value = (cardB>10 ? 10: cardB);

        A.only(() => {
          interact.updateOpponentHand(cardB_value);
        });
 
        // As mentioned above, "isOnA = cardA" is used to terminate the loop when players choose to STAND.
        [isOnA, isOnB, sumA, sumB] = [cardA_value, cardB_value, sumA + cardA_value, sumB + cardB_value];
        continue;
      }
      // ******************************** Game Loop Ends ********************************

      commit();

      A.only(() => { // Alice publishes the hidden card
        const [saltA, handA_First] = declassify([_saltA, _handA_First]);
      });
      A.publish(saltA, handA_First).timeout(DEADLINE, () => closeTo(B, informTimeout));
      checkCommitment(commitA, saltA, handA_First);
      commit();

      B.only(() => { // Bob publishes the hidden card
        const [saltB, handB_First] = declassify([_saltB, _handB_First]);
      });
      B.publish(saltB, handB_First).timeout(DEADLINE, () => closeTo(A, informTimeout));
      checkCommitment(commitB, saltB, handB_First);

      // Hidden cards are used to calculate the final results and determine the winner
      const totalA = sumA+handA_First;
      const totalB = sumB+handB_First;
      const distA = (totalA>21 ?  2*(totalA-21):(21-totalA)) ;
      const distB = (totalB>21 ?  2*(totalB-21):(21-totalB)) ;
      const outcome = winner(distA, distB);

      const [forA, forB] =
            outcome == 2 ? [2, 0] :
            outcome == 0 ? [0, 2] :
            [1, 1];
      transfer(forA * wager).to(A);
      transfer(forB * wager).to(B);
      commit();

      A.only(() => { // Bob publishes the hidden card
        interact.updateOpponentHand(handB_First);
      });
      
      B.only(() => { // Bob publishes the hidden card
        interact.updateOpponentHand(handA_First);
      });

      each([A, B], () => {
        interact.seeOutcome(outcome);
        
        //interact.seeSum([totalA, totalB]);
      });

      exit();});