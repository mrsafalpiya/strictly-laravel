<?php

namespace App\Domain\Issues;

enum IssuePriority: int
{
    case High = 2;
    case Low = 0;
    case Medium = 1;
}
