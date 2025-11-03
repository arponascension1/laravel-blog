<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Media;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with(['parent', 'children', 'image']);

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

        // Filter by parent (show root or specific parent's children)
        if ($request->filled('parent')) {
            if ($request->parent === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent);
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

        $categories = $query->paginate(20)->withQueryString();

        // Transform categories to include proper image URLs
        $transformedData = $categories->getCollection()->map(function ($category) {
            $categoryArray = $category->toArray();
            
            if ($category->image) {
                $categoryArray['image'] = [
                    'id' => $category->image->id,
                    'name' => $category->image->name,
                    'url' => str_replace(config('app.url'), '', $category->image->getUrl()),
                ];
            }
            
            return $categoryArray;
        });
        
        $categories->setCollection($transformedData);

        // Get all categories for parent dropdown
        $allCategories = Category::orderBy('order')->get()->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->path,
                'level' => count($category->getBreadcrumbs()) - 1,
            ];
        });

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'allCategories' => $allCategories,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'parent' => $request->parent,
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
        ]);
    }

    public function create()
    {
        $categories = Category::orderBy('order')->get()->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->path,
                'level' => count($category->getBreadcrumbs()) - 1,
            ];
        });

        return Inertia::render('admin/categories/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
            'image_id' => 'nullable|exists:media,id',
        ]);

        Category::create($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function edit(Category $category)
    {
        $category->load(['parent', 'image']);

        $categories = Category::where('id', '!=', $category->id)
            ->orderBy('order')
            ->get()
            ->map(function ($cat) use ($category) {
                // Prevent selecting a child as parent
                $descendants = $category->getAllDescendants()->pluck('id')->toArray();
                if (in_array($cat->id, $descendants)) {
                    return null;
                }
                
                return [
                    'id' => $cat->id,
                    'name' => $cat->path,
                    'level' => count($cat->getBreadcrumbs()) - 1,
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('admin/categories/edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'parent_id' => $category->parent_id,
                'order' => $category->order,
                'is_active' => $category->is_active,
                'meta_title' => $category->meta_title,
                'meta_description' => $category->meta_description,
                'meta_keywords' => $category->meta_keywords,
                'og_image' => $category->og_image,
                'color' => $category->color,
                'icon' => $category->icon,
                'image_id' => $category->image_id,
                'image' => $category->image ? [
                    'id' => $category->image->id,
                    'name' => $category->image->name,
                    'url' => str_replace(config('app.url'), '', $category->image->getUrl()),
                ] : null,
            ],
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    if ($value == $category->id) {
                        $fail('A category cannot be its own parent.');
                    }
                    
                    // Check if trying to set a descendant as parent
                    $descendants = $category->getAllDescendants()->pluck('id')->toArray();
                    if (in_array($value, $descendants)) {
                        $fail('Cannot set a child category as parent.');
                    }
                },
            ],
            'order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
            'image_id' => 'nullable|exists:media,id',
        ]);

        $category->update($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        // Check if category has children
        if ($category->children()->count() > 0) {
            return back()->with('error', 'Cannot delete category with subcategories. Delete or move subcategories first.');
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:categories,id',
        ]);

        $categories = Category::whereIn('id', $validated['ids'])->get();
        
        foreach ($categories as $category) {
            if ($category->children()->count() > 0) {
                return back()->with('error', 'Cannot delete categories with subcategories.');
            }
        }

        Category::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', count($validated['ids']) . ' categories deleted successfully.');
    }

    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['categories'] as $item) {
            Category::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return back()->with('success', 'Category order updated successfully.');
    }
}

