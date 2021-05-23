# Reach Modified Blackjack DApp

This is a modified version of the classic blackjack game implemented using Reach and runs on the Algorand blockchain. 
Implemented for the **Reach Bounty Hack Turkey**, where we won the first place. [Short demo](https://youtu.be/Vo8Yq0tMQRo)

## What is modified?

* Players can win from either side of the 21. However, going above 21 results in doubling your distance. 
* Each player hides the first card they draw, others will be published.

## Some small points

* Only 1 ACE can be counted as 11, rest will be interpreted as 1. The smart contract automatically chooses the optimal ACE value.
* If a players' published cards exceed 21, he/she can no longer hit.
* There is an infinite amount of copies of each card, there is no way to count the cards.

## Instructions
* Node.js, docker, docker-compose must be installed first.
* Run the Algorand devnet using `$ REACH_CONNECTOR_MODE=ALGO ./reach devnet`.

* Start the web-app with either
`$ ./reach react`
or 
`$ npm run start`

* Open the **http://localhost:3000** on your browser, ports might differ in your computer. Check the server terminal in case you can't see the server.

## Problems you can face

* If your docker container gets stuck in contract deployment, use `$ ./reach docker-reset` then restart the web-app and the devnet manually.

* In case you get a contract length error, `$ ./reach update` and  `$ ./reach compile`. Then start the servers again.
