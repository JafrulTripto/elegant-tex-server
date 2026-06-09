<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'role', 'content', 'created_at'];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
