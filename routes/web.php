<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        $stats = [
            'total_users' => \App\Models\User::count(),
            'admin_users' => \App\Models\User::where('role', 'admin')->count(),
            'regular_users' => \App\Models\User::where('role', 'user')->count(),
            'total_categories' => \App\Models\Category::count(),
            'active_categories' => \App\Models\Category::where('is_active', true)->count(),
            'total_tags' => \App\Models\Tag::count(),
            'active_tags' => \App\Models\Tag::where('is_active', true)->count(),
            'total_media' => \Spatie\MediaLibrary\MediaCollections\Models\Media::count(),
        ];
        
        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
        ]);
    })->name('dashboard');

    Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
    
    Route::prefix('media')->name('media.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\MediaController::class, 'index'])->name('index');
        Route::get('/api', [\App\Http\Controllers\Admin\MediaController::class, 'api'])->name('api');
        Route::post('/', [\App\Http\Controllers\Admin\MediaController::class, 'store'])->name('store');
        Route::delete('/{media}', [\App\Http\Controllers\Admin\MediaController::class, 'destroy'])->name('destroy');
        Route::get('/{media}/download', [\App\Http\Controllers\Admin\MediaController::class, 'download'])->name('download');
        Route::post('/{media}/move', [\App\Http\Controllers\Admin\MediaController::class, 'moveMedia'])->name('move');
        
        // Folder routes
        Route::post('/folders', [\App\Http\Controllers\Admin\MediaController::class, 'createFolder'])->name('folders.create');
        Route::put('/folders/{folder}', [\App\Http\Controllers\Admin\MediaController::class, 'updateFolder'])->name('folders.update');
        Route::delete('/folders/{folder}', [\App\Http\Controllers\Admin\MediaController::class, 'deleteFolder'])->name('folders.delete');
    });

    // Category routes
    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class);
    Route::post('/categories/bulk-delete', [\App\Http\Controllers\Admin\CategoryController::class, 'bulkDelete'])->name('categories.bulk-delete');
    Route::post('/categories/update-order', [\App\Http\Controllers\Admin\CategoryController::class, 'updateOrder'])->name('categories.update-order');

    // Tag routes
    Route::resource('tags', \App\Http\Controllers\Admin\TagController::class);
    Route::post('/tags/bulk-delete', [\App\Http\Controllers\Admin\TagController::class, 'bulkDelete'])->name('tags.bulk-delete');
    Route::post('/tags/update-order', [\App\Http\Controllers\Admin\TagController::class, 'updateOrder'])->name('tags.update-order');
});

require __DIR__.'/settings.php';
