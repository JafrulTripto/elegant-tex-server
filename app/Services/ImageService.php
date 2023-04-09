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
        $file->size = $imageData['size'];
        return $model->image()->save($file);
    }

    public function update(Model $model, $imageData)
    {
        // Delete all existing images associated with the order
        $model->image()->delete();

        // Check if there are any new images to add
        if (array_key_exists('images', $imageData) && !empty($imageData['images'])) {
            foreach ($imageData['images'] as $image) {
                $this->store($model, $image);
            }
        }
    }

}
