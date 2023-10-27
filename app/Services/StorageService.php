<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Symfony\Component\HttpFoundation\File\Exception\UploadException;

class StorageService implements IStorageService
{
    public function store(UploadedFile $file, string $path)
    {
        try {
            $imageName = $file->getClientOriginalName();
            $imageExt = $file->getClientOriginalExtension();
            $img = Image::make($file)->encode('jpg', 60);
            $imagePath = $path.'/'.$imageName;
            Storage::disk('s3')->put($imagePath, $img);

            return [
                "name" => $imageName,
                "ext" => $imageExt,
                "path" => $imagePath,
                "size" => $file->getSize()
            ];
        } catch (UploadException $exception){
            throw new UploadException($exception);
        }
    }

    public function destroy($filePath): bool
    {
        if (Storage::disk('s3')->exists($filePath)){
            return Storage::disk('s3')->delete($filePath);
        }
        return false;
    }
}
