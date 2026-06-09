<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Release extends Model
{
    public $timestamps = false;

    protected $fillable = ['version', 'title', 'features', 'released_at'];

    protected $casts = [
        'features'    => 'array',
        'released_at' => 'date',
        'created_at'  => 'datetime',
    ];
}
