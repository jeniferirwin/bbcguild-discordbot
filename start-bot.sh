#!/bin/bash

kill_node(){
    echo "killing node..."
    killall node
    echo "node killed"
    exit 1
}

trap kill_node TERM
npm run bot & wait
