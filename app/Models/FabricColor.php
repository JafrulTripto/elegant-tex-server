<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class FabricColor extends Model
{
    use HasFactory;

    protected $table = 'fabric_colors';

    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }

    public function imagePath()
    {
        if ($this->image()->exists()) {
            return $this->image()->first()->path;
        }
        return false;
    }
}
