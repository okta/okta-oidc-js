#!/bin/bash

if [ $SPA_CLIENT_ID ]
then
    export CLIENT_ID=$SPA_CLIENT_ID
    export REDIRECT_URI=http://localhost:3000/implicit/callback
fi
