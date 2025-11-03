<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MediaFolder extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'parent_id', 'path'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($folder) {
            $folder->updatePath();
        });

        static::updating(function ($folder) {
            $folder->updatePath();
        });
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(MediaFolder::class, 'parent_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class, 'folder_id');
    }

    public function updatePath()
    {
        if ($this->parent_id) {
            $parent = $this->parent;
            $this->path = $parent->path ? $parent->path . '/' . $this->name : $this->name;
        } else {
            $this->path = $this->name;
        }
    }

    public function getBreadcrumbs(): array
    {
        $breadcrumbs = [];
        $folder = $this;

        while ($folder) {
            array_unshift($breadcrumbs, [
                'id' => $folder->id,
                'name' => $folder->name,
            ]);
            $folder = $folder->parent;
        }

        return $breadcrumbs;
    }
}
