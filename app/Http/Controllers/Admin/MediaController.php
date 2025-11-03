<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\MediaFolder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $folderId = $request->get('folder');
        $currentFolder = $folderId ? MediaFolder::find($folderId) : null;
        $orderBy = $request->get('order_by', 'name'); // name, date, size, type
        $orderDir = $request->get('order_dir', 'asc'); // asc, desc

        // Get folders in current directory
        $foldersQuery = MediaFolder::query()->where('parent_id', $folderId);
        
        $folders = $foldersQuery->get()
            ->map(function ($folder) {
                return [
                    'type' => 'folder',
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'parent_id' => $folder->parent_id,
                    'path' => $folder->path,
                    'size' => 0, // For sorting purposes
                    'mime_type' => '', // For sorting purposes
                    'created_at' => $folder->created_at->toDateTimeString(),
                    'created_at_timestamp' => $folder->created_at->timestamp,
                ];
            });

        // Get media in current directory (all, not paginated yet)
        $query = Media::query()->where('folder_id', $folderId);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('mime_type', 'like', $request->type . '/%');
        }

        $mediaItems = $query->get()
            ->map(function ($item) {
                return [
                    'type' => 'file',
                    'id' => $item->id,
                    'name' => $item->name,
                    'file_name' => $item->file_name,
                    'mime_type' => $item->mime_type,
                    'size' => $item->size,
                    'folder_id' => $item->folder_id,
                    'url' => $item->getUrl(),
                    'preview_url' => $item->mime_type && str_starts_with($item->mime_type, 'image/') 
                        ? $item->getUrl() 
                        : null,
                    'created_at' => $item->created_at->toDateTimeString(),
                    'created_at_timestamp' => $item->created_at->timestamp,
                ];
            });

        // Combine folders and files
        $combined = collect($folders)->concat($mediaItems);

        // Sort combined collection
        $combined = $combined->sortBy(function ($item) use ($orderBy) {
            switch ($orderBy) {
                case 'date':
                    return $item['created_at_timestamp'];
                case 'size':
                    return $item['size'];
                case 'type':
                    // Folders first, then by mime_type
                    return $item['type'] === 'folder' ? 'aaa_folder' : $item['mime_type'];
                case 'name':
                default:
                    return strtolower($item['name']);
            }
        }, SORT_REGULAR, $orderDir === 'desc');

        // Manually paginate the combined collection
        $page = $request->get('page', 1);
        $perPage = 24;
        $total = $combined->count();
        $offset = ($page - 1) * $perPage;
        
        $paginatedItems = $combined->slice($offset, $perPage)->values();

        $breadcrumbs = $currentFolder ? $currentFolder->getBreadcrumbs() : [];

        return Inertia::render('admin/media/index', [
            'items' => [
                'data' => $paginatedItems,
                'current_page' => (int)$page,
                'last_page' => (int)ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total,
                'from' => $total > 0 ? $offset + 1 : 0,
                'to' => min($offset + $perPage, $total),
            ],
            'currentFolder' => $currentFolder ? [
                'id' => $currentFolder->id,
                'name' => $currentFolder->name,
                'parent_id' => $currentFolder->parent_id,
                'path' => $currentFolder->path,
            ] : null,
            'breadcrumbs' => $breadcrumbs,
            'filters' => $request->only(['search', 'type', 'folder', 'order_by', 'order_dir']),
        ]);
    }

    public function api(Request $request)
    {
        $folderId = $request->get('folder');
        $currentFolder = $folderId ? MediaFolder::find($folderId) : null;
        $orderBy = $request->get('order_by', 'name'); // name, date, size
        $orderDir = $request->get('order_dir', 'asc'); // asc, desc

        // Get folders in current directory
        $folders = MediaFolder::query()
            ->where('parent_id', $folderId)
            ->get()
            ->map(function ($folder) {
                return [
                    'type' => 'folder',
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'parent_id' => $folder->parent_id,
                    'created_at_timestamp' => $folder->created_at->timestamp,
                    'size' => 0,
                ];
            });

        // Get media in current directory
        $query = Media::query()->where('folder_id', $folderId);

        // Only get images
        $query->where('mime_type', 'like', 'image/%');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $mediaItems = $query->get()
            ->map(function ($item) {
                return [
                    'type' => 'file',
                    'id' => $item->id,
                    'name' => $item->name,
                    'file_name' => $item->file_name,
                    'mime_type' => $item->mime_type,
                    'url' => $item->getUrl(),
                    'created_at_timestamp' => $item->created_at->timestamp,
                    'size' => $item->size,
                ];
            });

        // Combine folders and files
        $combined = collect($folders)->concat($mediaItems);

        // Sort combined collection
        $combined = $combined->sortBy(function ($item) use ($orderBy) {
            switch ($orderBy) {
                case 'date':
                    return $item['created_at_timestamp'];
                case 'size':
                    return $item['size'];
                case 'name':
                default:
                    return strtolower($item['name']);
            }
        }, SORT_REGULAR, $orderDir === 'desc')->values();

        $breadcrumbs = $currentFolder ? $currentFolder->getBreadcrumbs() : [];

        return response()->json([
            'data' => $combined,
            'currentFolder' => $currentFolder ? [
                'id' => $currentFolder->id,
                'name' => $currentFolder->name,
                'parent_id' => $currentFolder->parent_id,
            ] : null,
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'folder_id' => 'nullable|exists:media_folders,id',
        ]);

        try {
            $file = $request->file('file');
            $folderId = $request->input('folder_id');
            
            // Create a temporary model to attach media to
            $tempModel = new class extends \Illuminate\Database\Eloquent\Model {
                use \Spatie\MediaLibrary\InteractsWithMedia;
                protected $table = 'users'; // Use existing table
                public $timestamps = false;
            };
            
            // Get first user as owner
            $user = \App\Models\User::first();
            if (!$user) {
                return response()->json(['error' => 'No user found'], 500);
            }

            $media = $user
                ->addMedia($file)
                ->toMediaCollection('uploads');

            // Update folder_id if provided
            if ($folderId) {
                $media->folder_id = $folderId;
                $media->save();
            }

            return response()->json([
                'success' => true,
                'media' => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'folder_id' => $media->folder_id,
                    'url' => $media->getUrl(),
                    'preview_url' => $media->mime_type && str_starts_with($media->mime_type, 'image/') 
                        ? $media->getUrl() 
                        : null,
                    'created_at' => $media->created_at->toDateTimeString(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Media $media)
    {
        try {
            $media->delete();
            return redirect()->back()->with('success', 'Media deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete media.');
        }
    }

    public function download(Media $media)
    {
        return response()->download($media->getPath(), $media->file_name);
    }

    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
        ]);

        // Check if folder with same name already exists in this parent
        $exists = MediaFolder::where('name', $request->name)
            ->where('parent_id', $request->parent_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'A folder with this name already exists in this location.'
            ], 422);
        }

        $folder = MediaFolder::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
        ]);

        return response()->json([
            'success' => true,
            'folder' => [
                'id' => $folder->id,
                'name' => $folder->name,
                'parent_id' => $folder->parent_id,
                'path' => $folder->path,
                'created_at' => $folder->created_at->toDateTimeString(),
            ],
        ]);
    }

    public function updateFolder(Request $request, MediaFolder $folder)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Check if folder with same name already exists in this parent (excluding current folder)
        $exists = MediaFolder::where('name', $request->name)
            ->where('parent_id', $folder->parent_id)
            ->where('id', '!=', $folder->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'A folder with this name already exists in this location.'
            ], 422);
        }

        $folder->update(['name' => $request->name]);

        return response()->json([
            'success' => true,
            'folder' => [
                'id' => $folder->id,
                'name' => $folder->name,
                'parent_id' => $folder->parent_id,
                'path' => $folder->path,
            ],
        ]);
    }

    public function deleteFolder(MediaFolder $folder)
    {
        try {
            // Check if folder has children or media
            $hasChildren = $folder->children()->count() > 0;
            $hasMedia = $folder->media()->count() > 0;
            
            if ($hasChildren || $hasMedia) {
                // Delete all media in this folder (this will also delete physical files)
                $mediaItems = $folder->media;
                foreach ($mediaItems as $media) {
                    // Spatie Media Library delete method handles file deletion
                    $media->delete();
                }
                
                // Recursively delete all subfolders
                foreach ($folder->children as $child) {
                    $this->deleteFolder($child);
                }
            }

            $folder->delete();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function moveMedia(Request $request, Media $media)
    {
        $request->validate([
            'folder_id' => 'nullable|exists:media_folders,id',
        ]);

        $media->update(['folder_id' => $request->folder_id]);

        return response()->json(['success' => true]);
    }
}
