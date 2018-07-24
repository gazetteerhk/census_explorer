#!/bin/bash

nginx

cd frontend
grunt watch &
cd -

cd backend
python main.py
