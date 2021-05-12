# Reach Modified Blackjack DApp

To run first make sure docker and docker-compose is installed.
Then

    ./reach scaffold

Append the following lines to the docker-compose.yml file

    player: &player
      <<: *default-app
      stdin_open: true
    alice: *player
    bob: *player

After that you can compile the reach code and build the program as follows

    ./reach compile
    make build
    
To play as Alice

    docker-compose run --rm alice
    
To play as Bob

    docker-compose run --rm bob
    
    
