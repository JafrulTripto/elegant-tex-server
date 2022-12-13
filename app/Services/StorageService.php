<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\File\Exception\UploadException;

class StorageService implements IStorageService
{
    public function store(UploadedFile $file, string $path)
    {
        try {
            $imagePath = Storage::disk('s3')->put($path, $file);
            return [
                "name" => $file->getClientOriginalName(),
                "ext" => $file->getClientOriginalExtension(),
                "path" => $imagePath
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
