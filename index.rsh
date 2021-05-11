'reach 0.1';

// TODO: First 2 cards must be given automatically (new function)
// TODO: Choose the winner according to the distance instead of sum
const winner = (distA, distB) =>
   (distA<distB ? 2:(distB<distA ? 0:1))
  
const Player =
{
  ...hasRandom,
  //getHand: Fun([], UInt),
  getCard: Fun([], UInt),
  seeOutcome: Fun([UInt], Null),
  seeSum: Fun([Tuple(UInt,UInt)], Null),
  updateOpponentHand: Fun([UInt], Null),
  informTimeout: Fun([], Null),
  seeHand : Fun([Tuple(UInt,UInt)], Null),
  setGame : Fun([],Tuple(UInt,UInt))
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

      A.only(() => { // Alice draws a card and commits
        const [_handA_First, _handA_Second] = interact.setGame();
        const [_commitA, _saltA] = makeCommitment(interact, _handA_First);
        const commitA = declassify(_commitA);
        const handA_Second  = declassify(_handA_Second);
      });
      A.publish(commitA,handA_Second).timeout(DEADLINE, () => closeTo(B, informTimeout));
      commit();

      
      unknowable(B, A(_handA_First, _saltA)); // Bob doesn't know Alice's card
      B.only(() => { // Bob draws a card and commits
        const [_handB_First, _handB_Second] = interact.setGame();
        const [_commitB, _saltB] = makeCommitment(interact, _handB_First);
        const commitB = declassify(_commitB);
        const handB_Second  = declassify(_handB_Second);
      });
      B.publish(commitB, handB_Second).timeout(DEADLINE, () => closeTo(A, informTimeout));
   
      A.only(() => {
        interact.updateOpponentHand(handB_Second);
      });

      B.only(() => {
        interact.updateOpponentHand(handA_Second);
      });

      // Game loop starts
      var [isOnA, isOnB, sumA, sumB] = [1, 1, handA_Second, handB_Second];
      invariant(balance() == 2 * wager);
      while (isOnA > 0 || isOnB > 0) {
        commit();

        A.only(() => {
          const cardA = declassify(interact.getCard());
        });
        A.publish(cardA).timeout(DEADLINE, () => closeTo(B, informTimeout));
        commit();

        B.only(() => {
          interact.updateOpponentHand(cardA);
        });

        B.only(() => {
          const cardB = declassify(interact.getCard());
        });
        B.publish(cardB).timeout(DEADLINE, () => closeTo(A, informTimeout));

        A.only(() => {
          interact.updateOpponentHand(cardB);
        });
 
        [isOnA, isOnB, sumA, sumB] = [cardA, cardB, sumA + cardA, sumB + cardB];
        continue;
      }
      // Game loop ends

      commit();
      A.only(() => { // Alice is publishes hidden card
        const [saltA, handA_First] = declassify([_saltA, _handA_First]);
      });
      A.publish(saltA, handA_First).timeout(DEADLINE, () => closeTo(B, informTimeout));
      checkCommitment(commitA, saltA, handA_First);
      commit();

      B.only(() => { // Bob is publishes hidden card
        const [saltB, handB_First] = declassify([_saltB, _handB_First]);
      });
      B.publish(saltB, handB_First).timeout(DEADLINE, () => closeTo(A, informTimeout));
      checkCommitment(commitB, saltB, handB_First);

      const totalA = sumA+handA_First;
      const totalB = sumB+handB_First;
      const distA = (totalA>21 ?  2*(totalA-21):(21-totalA)) ;
      const distB = (totalB>21 ?  2*(totalB-21):(21-totalB)) ;
      const outcome = winner(distA, distB);

      // TODO: transfer according to the winner
      const [forA, forB] =
            outcome == 2 ? [2, 0] :
            outcome == 0 ? [0, 2] :
            [1, 1];
      transfer(forA * wager).to(A);
      transfer(forB * wager).to(B);
      commit();

      each([A, B], () => {
        interact.seeOutcome(outcome);
        interact.seeSum([totalA, totalB]);
      });

      exit();});