<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;
use Illuminate\Support\Facades\Storage;

class Media extends BaseMedia
{
    protected $fillable = ['folder_id'];

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($media) {
            // Get the directory path where media files are stored
            $directory = dirname($media->getPath());
            
            // Delete the physical file from storage
            if (file_exists($media->getPath())) {
                @unlink($media->getPath());
            }
            
            // Delete any conversions/thumbnails
            foreach ($media->getGeneratedConversions() as $conversion => $generated) {
                if ($generated && file_exists($media->getPath($conversion))) {
                    @unlink($media->getPath($conversion));
                }
            }
            
            // Check if directory is empty and delete it
            if (is_dir($directory) && count(scandir($directory)) == 2) { // only . and ..
                @rmdir($directory);
            }
            
            // Also check and remove parent numbered directory if empty
            $parentDirectory = dirname($directory);
            if (is_dir($parentDirectory) && count(scandir($parentDirectory)) == 2) {
                @rmdir($parentDirectory);
            }
        });
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class);
    }
}
