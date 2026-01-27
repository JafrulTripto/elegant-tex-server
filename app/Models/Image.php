<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Image extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function imageable()
    {
        return $this->morphTo();
    }

    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        return Storage::disk('s3')->temporaryUrl(
            $this->path, now()->addMinutes(60)
        );
    }

}
