#!/usr/bin/env bash

kafka-topics.sh --create --bootstrap-server kafka:9092 --topic ride.requested --partitions 3 --replication-factor 1
kafka-topics.sh --create --bootstrap-server kafka:9092 --topic ride.accepted --partitions 3 --replication-factor 1
kafka-topics.sh --create --bootstrap-server kafka:9092 --topic ride.completed --partitions 3 --replication-factor 1
kafka-topics.sh --create --bootstrap-server kafka:9092 --topic location.update --partitions 3 --replication-factor 1
