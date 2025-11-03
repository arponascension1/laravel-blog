import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, FolderTree, Plus, Search, Trash2, Tag, ChevronUp, ChevronDown, type LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/admin/categories',
    },
];

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    order: number;
    is_active: boolean;
    color: string | null;
    icon: string | null;
    meta_title: string | null;
    meta_description: string | null;
    created_at: string;
    parent: {
        id: number;
        name: string;
    } | null;
    children: CategoryItem[];
    image: {
        id: number;
        name: string;
        url: string;
    } | null;
}

interface PaginatedCategories {
    data: CategoryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface CategoryOption {
    id: number;
    name: string;
    level: number;
}

interface Props {
    categories: PaginatedCategories;
    allCategories: CategoryOption[];
    filters: {
        search?: string;
        status?: string;
        parent?: string;
        order_by?: string;
        order_dir?: string;
    };
}

// Helper function to get Lucide icon component by name
const getIcon = (iconName: string | null): LucideIcon | null => {
    if (!iconName) return null;
    
    // Convert icon name to PascalCase (e.g., "laptop" -> "Laptop", "arrow-right" -> "ArrowRight")
    const pascalCase = iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    
    return (Icons as any)[pascalCase] || null;
};

export default function CategoriesIndex({ categories, allCategories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

    const navigate = (params: Record<string, any>) => {
        // Remove undefined values from params
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
        );
        
        router.get('/admin/categories', cleanParams, { 
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: any = {};
        if (search) params.search = search;
        if (filters.status && filters.status !== 'all') params.status = filters.status;
        if (filters.parent && filters.parent !== 'all') params.parent = filters.parent;
        // Only include order params if not default (order, asc)
        if (filters.order_by && filters.order_by !== 'order') params.order_by = filters.order_by;
        if (filters.order_dir && filters.order_dir !== 'asc') params.order_dir = filters.order_dir;
        navigate(params);
    };

    const handleStatusFilter = (value: string) => {
        const params: any = {};
        if (search) params.search = search;
        if (value !== 'all') params.status = value;
        if (filters.parent && filters.parent !== 'all') params.parent = filters.parent;
        // Only include order params if not default
        if (filters.order_by && filters.order_by !== 'order') params.order_by = filters.order_by;
        if (filters.order_dir && filters.order_dir !== 'asc') params.order_dir = filters.order_dir;
        navigate(params);
    };

    const handleParentFilter = (value: string) => {
        const params: any = {};
        if (search) params.search = search;
        if (filters.status && filters.status !== 'all') params.status = filters.status;
        if (value !== 'all') params.parent = value;
        // Only include order params if not default
        if (filters.order_by && filters.order_by !== 'order') params.order_by = filters.order_by;
        if (filters.order_dir && filters.order_dir !== 'asc') params.order_dir = filters.order_dir;
        navigate(params);
    };

    const handleSort = (column: string) => {
        const newDir = filters.order_by === column && filters.order_dir === 'asc' ? 'desc' : 'asc';
        const params: any = {};
        if (search) params.search = search;
        if (filters.status && filters.status !== 'all') params.status = filters.status;
        if (filters.parent && filters.parent !== 'all') params.parent = filters.parent;
        // Only include order params if not default (order, asc)
        if (column !== 'order') params.order_by = column;
        if (newDir !== 'asc') params.order_dir = newDir;
        navigate(params);
    };

    const handleDelete = () => {
        if (!categoryToDelete) return;

        router.delete(`/admin/categories/${categoryToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setCategoryToDelete(null);
            },
        });
    };

    const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => {
        const isActive = filters.order_by === column;
        const isAsc = filters.order_dir === 'asc';

        return (
            <th 
                className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors select-none"
                onClick={() => handleSort(column)}
            >
                <div className="flex items-center gap-2">
                    {children}
                    <div className="flex flex-col">
                        <ChevronUp 
                            className={`h-3 w-3 -mb-1 transition-colors ${
                                isActive && isAsc ? 'text-primary' : 'text-muted-foreground/50'
                            }`} 
                        />
                        <ChevronDown 
                            className={`h-3 w-3 -mt-1 transition-colors ${
                                isActive && !isAsc ? 'text-primary' : 'text-muted-foreground/50'
                            }`} 
                        />
                    </div>
                </div>
            </th>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your blog categories and subcategories
                        </p>
                    </div>
                    <Link href="/admin/categories/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>

                    <Select 
                        value={filters.status || 'all'} 
                        onValueChange={handleStatusFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select 
                        value={filters.parent || 'all'} 
                        onValueChange={handleParentFilter}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Parent Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="root">Root Only</SelectItem>
                            {allCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Categories Table */}
                <div className="rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <SortableHeader column="order">Order</SortableHeader>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
                                    <SortableHeader column="name">Category</SortableHeader>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Parent</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Children</th>
                                    <SortableHeader column="created_at">Created</SortableHeader>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {categories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                            <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No categories found</p>
                                            <Link href="/admin/categories/create">
                                                <Button variant="link" className="mt-2">
                                                    Create your first category
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.data.map((category) => (
                                        <tr key={category.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3 text-sm">
                                                <span className="font-mono text-muted-foreground">
                                                    {category.order}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {category.image ? (
                                                    <img
                                                        src={category.image.url}
                                                        alt={category.name}
                                                        className="w-12 h-12 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                                        <Tag className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {category.icon && (() => {
                                                        const IconComponent = getIcon(category.icon);
                                                        return IconComponent ? (
                                                            <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                        ) : null;
                                                    })()}
                                                    {category.color && (
                                                        <div
                                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: category.color }}
                                                        />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{category.name}</p>
                                                        {category.description && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {category.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <code className="px-2 py-1 bg-muted rounded text-xs">
                                                    {category.slug}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {category.parent ? (
                                                    <div className="flex items-center gap-1">
                                                        <FolderTree className="h-3 w-3 text-muted-foreground" />
                                                        {category.parent.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Root</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {category.is_active ? (
                                                    <Badge variant="default" className="bg-green-600">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {category.children.length > 0 ? (
                                                    <Badge variant="outline">
                                                        {category.children.length}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(category.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/categories/${category.id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setCategoryToDelete(category)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {categories.from || 0} to {categories.to || 0} of {categories.total} categories
                    </p>
                    {categories.last_page > 1 && (
                        <div className="flex gap-2">
                            {categories.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "<strong>{categoryToDelete?.name}</strong>"?
                            This action cannot be undone.
                            {categoryToDelete?.children && categoryToDelete.children.length > 0 && (
                                <p className="text-destructive mt-2">
                                    Warning: This category has {categoryToDelete.children.length} subcategories.
                                    Please delete or move them first.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
