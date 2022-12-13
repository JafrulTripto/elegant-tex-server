<?php

namespace App\Services;

use App\Models\Image;
use Illuminate\Database\Eloquent\Model;

class ImageService
{
    public function store(Model $model, $imageData)
    {

        $file = new Image();
        $file->path = $imageData['path'];
        $file->ext = $imageData['ext'];
        $file->name = $imageData['name'];
        return $model->image()->save($file);
    }
}
