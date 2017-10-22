#!/bin/bash
# Sometimes the server haults our connection (rate thorottling?) so the donwloaded data file is 0 size
# This script deletes the error files and re-run the pipeline.
# Download scripts will deduplicate itself so as to save some workload.

echo "Downloaded files with 0 size (error):"
find data/download/ -size 0
find data/download/ -size 0 | xargs rm
python data_preparation.py

