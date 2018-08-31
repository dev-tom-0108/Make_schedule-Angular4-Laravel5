<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Guest extends Authenticatable
{
    protected $table = 'guests';  
    public function authorizeRoles($roles, $isWrite = 0)
    {
        return true;
    }

}
