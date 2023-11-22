#!/bin/bash
if [ ! -f "./init/done" ]; then
    npm run init-database && touch ./init/done;
fi