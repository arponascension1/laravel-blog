<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tag extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'is_active',
        'order',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_image',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        // Auto-generate slug if not provided
        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }

            // Ensure unique slug
            $originalSlug = $tag->slug;
            $count = 1;
            while (static::where('slug', $tag->slug)->exists()) {
                $tag->slug = $originalSlug . '-' . $count++;
            }
        });

        static::updating(function ($tag) {
            if ($tag->isDirty('name') && !$tag->isDirty('slug')) {
                $tag->slug = Str::slug($tag->name);

                // Ensure unique slug (excluding current tag)
                $originalSlug = $tag->slug;
                $count = 1;
                while (static::where('slug', $tag->slug)
                    ->where('id', '!=', $tag->id)
                    ->exists()) {
                    $tag->slug = $originalSlug . '-' . $count++;
                }
            }
        });
    }

    // Scope for active tags
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
