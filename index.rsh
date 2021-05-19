'reach 0.1';

const winner = (distA, distB) =>
  (distA < distB ? 2 : (distB < distA ? 0 : 1))

/* const distanceFrom = (distFrom, distTo) =>
  (distFrom > distTo ? 2 * (distFrom - distTo) : (distTo - distFrom))
 */
function distanceFrom(distFrom, distTo) {
  if (distFrom > distTo) {
    return 2 * (distFrom - distTo);
  }
  else {
    return (distTo - distFrom);
  }
}
const cardValue = (i) =>
  (i < 10 ? i : 10)

const Player =
{
  ...hasRandom,
  getCard: Fun([], UInt), // Get a random card from the front end
  seeOutcome: Fun([UInt, UInt, UInt], Null), // Print the outcome of the game
  //seeSum: Fun([Array(UInt, 2)], Null), // Total sum of each players hands
  updateOpponentHand: Fun([UInt], Null), // Send opponent's hand information to the frontend
  informTimeout: Fun([], Null),
  setGame: Fun([], Tuple(UInt, UInt)), // Initial card distributions
  revelLastCard: Fun([UInt], Null),
  getResultView: Fun([], Null),
  printThis: Fun([UInt], Null),
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
        const handA_Second = declassify(_handA_Second);
      });
      A.publish(commitA, handA_Second).timeout(DEADLINE, () => closeTo(B, informTimeout));
      commit();

      B.only(() => { // Bob draws 2 cards, hides 1 and publishes 1.
        const [_handB_First, _handB_Second] = interact.setGame();
        const [_commitB, _saltB] = makeCommitment(interact, _handB_First);
        const commitB = declassify(_commitB);
        const handB_Second = declassify(_handB_Second);
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
      var [aHits, bHits, sumA, sumB, ACEcountA, ACEcountB, turn] = [1, 1, cardValue(handA_Second), cardValue(handB_Second), 0, 0, 0];
      invariant(balance() == 2 * wager);
      while (aHits > 0 || bHits > 0) {

        // IN consensus step
        if (turn == 0 && sumA < 21) { // Players stop drawing cards after their published hand exceeds 21
          commit();
          A.only(() => { // Choose whether to HIT or STAND
            const cardA = declassify(interact.getCard());
          });
          A.publish(cardA).timeout(DEADLINE, () => closeTo(B, informTimeout));

          B.only(() => { // Bob updates front end again
            interact.updateOpponentHand(cardA);
          });

          if (cardA == 1) {
            [aHits, sumA, ACEcountA, turn] = [cardA, sumA + cardValue(cardA), ACEcountA + 1, 1];
            continue;
          }

          [aHits, sumA, turn] = [cardA, sumA + cardValue(cardA), 1]
          continue;
        }
        /* 
                if(aHits == 0 && bHits == 0) // To prevent the case where 3 STAND in a row is needed
                {
                  continue;
                } */

        // IN consensus step here

        if (sumB < 21) {
          commit();
          B.only(() => {
            const cardB = declassify(interact.getCard());
          });
          B.publish(cardB).timeout(DEADLINE, () => closeTo(A, informTimeout));

          A.only(() => {
            interact.updateOpponentHand(cardB);
          });

          if (cardB == 1) {
            [bHits, sumB, ACEcountB, turn] = [cardB, sumB + cardValue(cardB), ACEcountB + 1, 0];
            continue;
          }
          [bHits, sumB, turn] = [cardB, sumB + cardValue(cardB), 0]
          continue;
        }

        commit();
        A.publish(); // Dummy publish
        [aHits, bHits] = [0, 0]; // This state will only be reached if (sumA>21 && sumB>21)
        continue;

        // IN consensus step here

        // As mentioned above, "isOnA = cardA" is used to terminate the loop when players choose to STAND.
        //[isOnA, isOnB, sumA, sumB] = [cardValue(cardA), cardValue(cardB), sumA + cardValue(cardA), sumB + cardValue(cardB)];
        //[isOnA, isOnB, sumA, sumB, AScountA, AScountB] = [cardValue(cardA), cardValue(cardB), sumA, sumB + cardValue(cardB), AScountA + 1, AScountB];
        //[isOnA, isOnB, sumA, sumB, AScountA, AScountB] = [cardValue(cardA), cardValue(cardB), sumA, sumB + cardValue(cardB), AScountA, AScountB+1];
        //[isOnA, isOnB, sumA, sumB, AScountA, AScountB] = [cardValue(cardA), cardValue(cardB), sumA + cardValue(cardA), sumB + cardValue(cardB), AScountA, AScountB];
      }
      // ******************************** Game Loop Ends ********************************
      commit();

      A.only(() => { // Alice publishes the hidden card
        interact.getResultView();
        const [saltA, handA_First] = declassify([_saltA, _handA_First]);
      });
      A.publish(saltA, handA_First).timeout(DEADLINE, () => closeTo(B, informTimeout));
      checkCommitment(commitA, saltA, handA_First);
      commit();

      B.only(() => { // Bob publishes the hidden card
        interact.getResultView();
        const [saltB, handB_First] = declassify([_saltB, _handB_First]);
      });
      B.publish(saltB, handB_First).timeout(DEADLINE, () => closeTo(A, informTimeout));
      checkCommitment(commitB, saltB, handB_First);

      // Hidden cards are used to calculate the final results and determine the winner
      const A_totalBeforeAce = sumA + cardValue(handA_First);
      const finalTotalA = (ACEcountA > 0 || handA_First == 1) ?
        ((distanceFrom(A_totalBeforeAce + 10, 21) < distanceFrom(A_totalBeforeAce, 21)) ? A_totalBeforeAce + 10 : A_totalBeforeAce)
        : A_totalBeforeAce;

      const B_totalBeforeAce = sumB + cardValue(handB_First);
      const finalTotalB = (ACEcountB > 0 || handB_First == 1) ?
        ((distanceFrom(B_totalBeforeAce + 10, 21) < distanceFrom(B_totalBeforeAce, 21)) ? B_totalBeforeAce + 10 : B_totalBeforeAce)
        : B_totalBeforeAce;

      // Following code is the if-else version of the statemens
      /*  if (ACEcountB > 0 || handB_First == 1) // At least one ACE
       {
         if (distanceFrom(totalB + 10, 21) < distanceFrom(totalB, 21)) { // ACE is better as 11
           const finalTotalB = totalB + 10;
         }
         else { // ACE is better as 1
           const finalTotalB = totalB;
         }
       }
       else { // No ACE
         const finalTotalB = totalB;
       } */

      const outcome = winner(distanceFrom(finalTotalA, 21), distanceFrom(finalTotalB, 21));

      const [forA, forB] =
        outcome == 2 ? [2, 0] :
          outcome == 0 ? [0, 2] :
            [1, 1];
      transfer(forA * wager).to(A);
      transfer(forB * wager).to(B);
      commit();

      A.only(() => { // Alice publishes the hidden card to the frontend
        interact.revelLastCard(handB_First);
      });

      B.only(() => { // Bob publishes the hidden card
        interact.revelLastCard(handA_First);
      });

      each([A, B], () => {
        interact.seeOutcome(outcome, finalTotalA, finalTotalB);
      });

      exit();
    });