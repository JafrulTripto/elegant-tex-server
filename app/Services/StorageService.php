<?php

namespace App\Services;


use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Symfony\Component\HttpFoundation\File\Exception\UploadException;

class StorageService implements IStorageService
{
    public function store(UploadedFile $file, string $path)
    {
        $datetime = Carbon::now()->timestamp;
        try {
            $imageName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $imageExt = $file->getClientOriginalExtension();
            $imageNameWithDatetime = $imageName . '_' . $datetime . '.' . $imageExt;

            $img = Image::make($file)->encode('jpg', 60);
            $imagePath = $path . '/' . $imageNameWithDatetime;
            Storage::disk('s3')->put($imagePath, $img);

            return [
                "name" => $imageNameWithDatetime,
                "ext" => $imageExt,
                "path" => $imagePath,
                "size" => $file->getSize()
            ];
        } catch (UploadException $exception) {
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
