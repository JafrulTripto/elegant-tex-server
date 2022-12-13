<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

interface IStorageService
{
    public function store(UploadedFile $file, string $path);
}
