<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $query = Tag::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Sorting
        $orderBy = $request->get('order_by', 'order');
        $orderDir = $request->get('order_dir', 'asc');
        
        if (in_array($orderBy, ['name', 'created_at', 'order'])) {
            $query->orderBy($orderBy, $orderDir);
        } else {
            $query->orderBy('order', 'asc');
        }

        $tags = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/tags/index', [
            'tags' => $tags,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/tags/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:tags,slug',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);

        Tag::create($validated);

        return redirect()->route('admin.tags.index')
            ->with('success', 'Tag created successfully.');
    }

    public function edit(Tag $tag)
    {
        return Inertia::render('admin/tags/edit', [
            'tag' => $tag,
        ]);
    }

    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:tags,slug,' . $tag->id,
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
        ]);

        $validated['is_active'] = $request->boolean('is_active');

        $tag->update($validated);

        return redirect()->route('admin.tags.index')
            ->with('success', 'Tag updated successfully.');
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();

        return redirect()->route('admin.tags.index')
            ->with('success', 'Tag deleted successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tags,id',
        ]);

        Tag::whereIn('id', $request->ids)->delete();

        return redirect()->route('admin.tags.index')
            ->with('success', count($request->ids) . ' tag(s) deleted successfully.');
    }

    public function updateOrder(Request $request)
    {
        $request->validate([
            'tags' => 'required|array',
            'tags.*.id' => 'required|exists:tags,id',
            'tags.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->tags as $tagData) {
            Tag::where('id', $tagData['id'])->update(['order' => $tagData['order']]);
        }

        return back()->with('success', 'Tag order updated successfully.');
    }
}
