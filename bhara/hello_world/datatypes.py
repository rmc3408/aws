import time
import os
import random

global_val = random.random()  # stay in memory, create when build file.


def cold_local(event, context):
    local_val = random.random()  # create when run labda function
    print(local_val)
    print(global_val)


def simple_type(event, _context):
    print(event)
    return event


def list_type(event, _context):
    print(event)
    student = {"name": "raphael", "age": 28, "grade": "B+"}
    score = []
    for item in event:
        score.append(student[item])
    return score


def dic_type(event, context):
    print(event)
    print(context)
    time.sleep(1)
    print(os.getenv('dbname'))
    return event
