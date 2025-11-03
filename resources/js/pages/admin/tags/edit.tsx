import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tags',
        href: '/admin/tags',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface Tag {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    order: number;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    og_image: string | null;
}

interface Props {
    tag: Tag;
}

export default function TagEdit({ tag }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    
    const { data, setData, put, processing, errors } = useForm({
        name: tag.name,
        slug: tag.slug,
        description: tag.description || '',
        color: tag.color || '',
        order: tag.order,
        is_active: tag.is_active,
        meta_title: tag.meta_title || '',
        meta_description: tag.meta_description || '',
        meta_keywords: tag.meta_keywords || '',
        og_image: tag.og_image || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/tags/${tag.id}`);
    };

    const handleDelete = () => {
        router.delete(`/admin/tags/${tag.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Tag: ${tag.name}`} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/tags">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Tag</h1>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                    <p className="text-muted-foreground ml-14">
                        Update tag information
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., JavaScript"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="Auto-generated from name"
                                    className={errors.slug ? 'border-destructive' : ''}
                                />
                                {errors.slug && (
                                    <p className="text-sm text-destructive">{errors.slug}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                placeholder="Brief description of this tag"
                                rows={3}
                                className={errors.description ? 'border-destructive' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={data.color || '#000000'}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-20 h-10"
                                    />
                                    <Input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.is_active ? 'active' : 'inactive'}
                                    onValueChange={(value) => setData('is_active', value === 'active')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-1">SEO Settings</h2>
                            <p className="text-sm text-muted-foreground">
                                Optimize your tag for search engines
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input
                                    id="meta_title"
                                    value={data.meta_title}
                                    onChange={(e) => setData('meta_title', e.target.value)}
                                    placeholder="SEO-optimized title"
                                    className={errors.meta_title ? 'border-destructive' : ''}
                                />
                                {errors.meta_title && (
                                    <p className="text-sm text-destructive">{errors.meta_title}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Recommended: 50-60 characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea
                                    id="meta_description"
                                    value={data.meta_description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('meta_description', e.target.value)}
                                    placeholder="Brief description for search engines"
                                    rows={3}
                                    className={errors.meta_description ? 'border-destructive' : ''}
                                />
                                {errors.meta_description && (
                                    <p className="text-sm text-destructive">{errors.meta_description}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Recommended: 150-160 characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                <Input
                                    id="meta_keywords"
                                    value={data.meta_keywords}
                                    onChange={(e) => setData('meta_keywords', e.target.value)}
                                    placeholder="keyword1, keyword2, keyword3"
                                    className={errors.meta_keywords ? 'border-destructive' : ''}
                                />
                                {errors.meta_keywords && (
                                    <p className="text-sm text-destructive">{errors.meta_keywords}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="og_image">OG Image URL</Label>
                                <Input
                                    id="og_image"
                                    value={data.og_image}
                                    onChange={(e) => setData('og_image', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className={errors.og_image ? 'border-destructive' : ''}
                                />
                                {errors.og_image && (
                                    <p className="text-sm text-destructive">{errors.og_image}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href="/admin/tags">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            Update Tag
                        </Button>
                    </div>
                </form>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{tag.name}"? This action cannot be undone.
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
