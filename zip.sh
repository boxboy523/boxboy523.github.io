#!/usr/bin/env bash
HW_NUM=$1
STUDENT_NAME=$2

zip "hw${HW_NUM}_${STUDENT_NAME}".zip "hw$HW_NUM".html "src/hw$HW_NUM".js
