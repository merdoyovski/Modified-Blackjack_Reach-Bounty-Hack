'reach 0.1';

const [isHand, ROCK, PAPER, SCISSORS] = makeEnum(3);
const [isOutcome, B_WINS, DRAW, A_WINS] = makeEnum(3);
const [isCard, ZERO, ONE, TWO] = makeEnum(3);

const winner = (sumA, sumB) =>
  (sumA > sumB ? 2 : (sumA < sumB ? 0 : 1));

const Player =
{
  ...hasRandom,
  getHand: Fun([], UInt),
  getCard: Fun([], UInt),
  seeOutcome: Fun([UInt], Null),
  seeSum: Fun([Tuple(UInt,UInt)], Null),
  informTimeout: Fun([], Null)
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
        const _handA = interact.getCard();
        const [_commitA, _saltA] = makeCommitment(interact, _handA);
        const commitA = declassify(_commitA);
      });
      A.publish(commitA);
      commit();

      unknowable(B, A(_handA, _saltA)); // Bob doesn't know Alice's card
      B.only(() => { // Bob draws a card and commits
        //interact.acceptWager(wager);
        const _handB = interact.getCard();
        const [_commitB, _saltB] = makeCommitment(interact, _handB);
        const commitB = declassify(_commitB);
      });
      B.publish(commitB)
        .timeout(DEADLINE, () => closeTo(A, informTimeout));

      var [isOnA, isOnB, sumA, sumB] = [1, 1, 0, 0];
      invariant(balance() == 2 * wager);
      while (isOnA > 0 || isOnB > 0) {
        commit();

        A.only(() => {
          const cardA = declassify(interact.getCard());
        });
        A.publish(cardA);
        commit();

        B.only(() => {
          const cardB = declassify(interact.getCard());
        });
        B.publish(cardB);
        [isOnA, isOnB, sumA, sumB] = [cardA, cardB, sumA + cardA, sumB + cardB];

        continue;

      }

      // Game loop ends

      const outcome = winner(sumA, sumB);
      commit();
      A.only(() => { // Alice is publishes hidden card
        const [saltA, handA] = declassify([_saltA, _handA]);
      });
      A.publish(saltA, handA).timeout(DEADLINE, () => closeTo(B, informTimeout));
      checkCommitment(commitA, saltA, handA);
      commit();

      B.only(() => { // Bob is publishes hidden card
        const [saltB, handB] = declassify([_saltB, _handB]);
      });
      B.publish(saltB, handB).timeout(DEADLINE, () => closeTo(A, informTimeout));
      checkCommitment(commitB, saltB, handB);


      transfer(wager * 2).to(A);

      commit();

      each([A, B], () => {
        interact.seeOutcome(outcome);
        interact.seeSum([sumA, sumB]);
      });
      exit();
    });