<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Admin extends Authenticatable
{
    use HasApiTokens;
    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password'];
}
