import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, Tag as TagIcon, ChevronUp, ChevronDown } from 'lucide-react';
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
        title: 'Tags',
        href: '/admin/tags',
    },
];

interface TagItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    order: number;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    created_at: string;
}

interface PaginatedTags {
    data: TagItem[];
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

interface Props {
    tags: PaginatedTags;
    filters: {
        search?: string;
        status?: string;
        order_by?: string;
        order_dir?: string;
    };
}

export default function TagsIndex({ tags, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [tagToDelete, setTagToDelete] = useState<TagItem | null>(null);

    const navigate = (params: Record<string, any>) => {
        // Remove undefined values from params
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
        );
        
        router.get('/admin/tags', cleanParams, { 
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: any = {};
        if (search) params.search = search;
        if (filters.status && filters.status !== 'all') params.status = filters.status;
        // Only include order params if not default (order, asc)
        if (filters.order_by && filters.order_by !== 'order') params.order_by = filters.order_by;
        if (filters.order_dir && filters.order_dir !== 'asc') params.order_dir = filters.order_dir;
        navigate(params);
    };

    const handleStatusFilter = (value: string) => {
        const params: any = {};
        if (search) params.search = search;
        if (value !== 'all') params.status = value;
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
        // Only include order params if not default (order, asc)
        if (column !== 'order') params.order_by = column;
        if (newDir !== 'asc') params.order_dir = newDir;
        navigate(params);
    };

    const handleDelete = () => {
        if (!tagToDelete) return;
        router.delete(`/admin/tags/${tagToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setTagToDelete(null);
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
            <Head title="Tags" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your blog tags
                        </p>
                    </div>
                    <Link href="/admin/tags/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Tag
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
                                placeholder="Search tags..."
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
                </div>

                {/* Tags Table */}
                <div className="rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <SortableHeader column="order">Order</SortableHeader>
                                    <SortableHeader column="name">Tag</SortableHeader>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <SortableHeader column="created_at">Created</SortableHeader>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {tags.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            <TagIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No tags found</p>
                                            <Link href="/admin/tags/create">
                                                <Button variant="link" className="mt-2">
                                                    Create your first tag
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    tags.data.map((tag) => (
                                        <tr key={tag.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3 text-sm">
                                                <span className="font-mono text-muted-foreground">
                                                    {tag.order}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {tag.color && (
                                                        <div
                                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: tag.color }}
                                                        />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{tag.name}</p>
                                                        {tag.description && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {tag.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <code className="px-2 py-1 bg-muted rounded text-xs">
                                                    {tag.slug}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3">
                                                {tag.is_active ? (
                                                    <Badge variant="default" className="bg-green-600">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(tag.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/tags/${tag.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => setTagToDelete(tag)}
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
                        Showing {tags.from || 0} to {tags.to || 0} of {tags.total} tags
                    </p>
                    {tags.last_page > 1 && (
                        <div className="flex gap-2">
                            {tags.links.map((link, index) => (
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

            <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{tagToDelete?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
