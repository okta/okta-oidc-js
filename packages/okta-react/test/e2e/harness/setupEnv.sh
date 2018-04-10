#!/bin/bash

if [ $SPA_CLIENT_ID ]
then
    export CLIENT_ID=$SPA_CLIENT_ID
    export REDIRECT_URI=http://localhost:8080/implicit/callback
fi
