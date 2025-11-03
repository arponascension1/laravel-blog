import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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
import { MediaSelector } from '@/components/media-selector';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/admin/categories',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface CategoryOption {
    id: number;
    name: string;
    level: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    order: number;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    og_image: string | null;
    color: string | null;
    icon: string | null;
    image_id: number | null;
    image: {
        id: number;
        name: string;
        url: string;
    } | null;
}

interface Props {
    category: Category;
    categories: CategoryOption[];
}

export default function CategoryEdit({ category, categories }: Props) {
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        category.image?.url || null
    );
    
    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent_id: category.parent_id?.toString() || '',
        order: category.order || 0,
        is_active: category.is_active,
        meta_title: category.meta_title || '',
        meta_description: category.meta_description || '',
        meta_keywords: category.meta_keywords || '',
        og_image: category.og_image || '',
        color: category.color || '',
        icon: category.icon || '',
        image_id: category.image_id?.toString() || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/categories/${category.id}`);
    };

    const handleImageSelect = (imageId: number, imageUrl: string) => {
        setData('image_id', imageId.toString());
        setSelectedImageUrl(imageUrl);
    };

    const handleImageClear = () => {
        setData('image_id', '');
        setSelectedImageUrl(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Category: ${category.name}`} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-2">
                        <Link href="/admin/categories">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
                    </div>
                    <p className="text-muted-foreground ml-14">
                        Update category: {category.name}
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
                                    placeholder="e.g., Technology"
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
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to auto-generate from name
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                placeholder="Brief description of this category"
                                rows={3}
                                className={errors.description ? 'border-destructive' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="parent_id">Parent Category</Label>
                                <Select value={data.parent_id || 'none'} onValueChange={(value) => setData('parent_id', value === 'none' ? '' : value)}>
                                    <SelectTrigger className={errors.parent_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="None (Root)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Root)</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {'—'.repeat(category.level)} {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.parent_id && (
                                    <p className="text-sm text-destructive">{errors.parent_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    min="0"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    className={errors.order ? 'border-destructive' : ''}
                                />
                                {errors.order && (
                                    <p className="text-sm text-destructive">{errors.order}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="is_active">Status</Label>
                                <Select value={data.is_active ? 'true' : 'false'} onValueChange={(value) => setData('is_active', value === 'true')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={data.color || '#3b82f6'}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-20 h-10 cursor-pointer"
                                    />
                                    <Input
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        placeholder="#3b82f6"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Optional color for category badge
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon</Label>
                                <Input
                                    id="icon"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    placeholder="e.g., laptop, book, code"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lucide icon name (optional)
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Category Image</Label>
                            <MediaSelector
                                selectedImageId={data.image_id ? parseInt(data.image_id) : null}
                                selectedImageUrl={selectedImageUrl}
                                onSelect={handleImageSelect}
                                onClear={handleImageClear}
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional featured image for the category
                            </p>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-1">SEO Settings</h2>
                            <p className="text-sm text-muted-foreground">
                                Optimize category for search engines
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meta_title">Meta Title</Label>
                            <Input
                                id="meta_title"
                                value={data.meta_title}
                                onChange={(e) => setData('meta_title', e.target.value)}
                                placeholder="SEO-optimized title (leave empty to use category name)"
                                maxLength={60}
                            />
                            <p className="text-xs text-muted-foreground">
                                {data.meta_title.length}/60 characters (recommended)
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
                                maxLength={160}
                            />
                            <p className="text-xs text-muted-foreground">
                                {data.meta_description.length}/160 characters (recommended)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meta_keywords">Meta Keywords</Label>
                            <Input
                                id="meta_keywords"
                                value={data.meta_keywords}
                                onChange={(e) => setData('meta_keywords', e.target.value)}
                                placeholder="keyword1, keyword2, keyword3"
                            />
                            <p className="text-xs text-muted-foreground">
                                Comma-separated keywords
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="og_image">OG Image URL</Label>
                            <Input
                                id="og_image"
                                value={data.og_image}
                                onChange={(e) => setData('og_image', e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                            <p className="text-xs text-muted-foreground">
                                Image for social media sharing (1200x630px recommended)
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Category'}
                        </Button>
                        <Link href="/admin/categories">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
