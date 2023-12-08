#!/bin/bash

SERVER_IP=$(host backend | grep 'has address' | awk '{print $4}')
echo "REACT_APP_SERVER_IP=$SERVER_IP" > .env
echo "SERVER_IP is set to: $SERVER_IP"
