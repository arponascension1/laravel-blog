import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download, FileIcon, FolderIcon, FolderPlus, Image as ImageIcon, Search, Trash2, Upload, Video, Edit, ChevronRight, Eye } from 'lucide-react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState, useCallback } from 'react';
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
import { useDropzone } from 'react-dropzone';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Media Library',
        href: '/admin/media',
    },
];

interface MediaItem {
    type: 'file';
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    folder_id: number | null;
    url: string;
    preview_url?: string;
    created_at: string;
}

interface FolderItem {
    type: 'folder';
    id: number;
    name: string;
    parent_id: number | null;
    path: string;
    size: number;
    mime_type: string;
    created_at: string;
}

type CombinedItem = MediaItem | FolderItem;

interface CurrentFolder {
    id: number;
    name: string;
    parent_id: number | null;
    path: string;
}

interface Breadcrumb {
    id: number;
    name: string;
}

interface PaginatedItems {
    data: CombinedItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    items: PaginatedItems;
    currentFolder: CurrentFolder | null;
    breadcrumbs: Breadcrumb[];
    filters: {
        search?: string;
        type?: string;
        folder?: number;
        order_by?: string;
        order_dir?: string;
    };
}

export default function MediaIndex({ items, currentFolder, breadcrumbs: folderBreadcrumbs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [orderBy, setOrderBy] = useState(filters.order_by || 'name');
    const [orderDir, setOrderDir] = useState(filters.order_dir || 'asc');
    const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<FolderItem | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creatingFolder, setCreatingFolder] = useState(false);
    const [previewImage, setPreviewImage] = useState<MediaItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: any = {};
        if (search) params.search = search;
        if (type && type !== 'all') params.type = type;
        if (currentFolder) params.folder = currentFolder.id;
        if (orderBy) params.order_by = orderBy;
        if (orderDir) params.order_dir = orderDir;
        router.get('/admin/media', params, { preserveState: true });
    };

    const handleTypeFilter = (value: string) => {
        setType(value);
        const params: any = {};
        if (search) params.search = search;
        if (value && value !== 'all') params.type = value;
        if (currentFolder) params.folder = currentFolder.id;
        if (orderBy) params.order_by = orderBy;
        if (orderDir) params.order_dir = orderDir;
        router.get('/admin/media', params, { preserveState: true });
    };

    const handleOrderByChange = (value: string) => {
        setOrderBy(value);
        const params: any = {};
        if (search) params.search = search;
        if (type && type !== 'all') params.type = type;
        if (currentFolder) params.folder = currentFolder.id;
        params.order_by = value;
        if (orderDir) params.order_dir = orderDir;
        router.get('/admin/media', params, { preserveState: true });
    };

    const handleOrderDirChange = (value: string) => {
        setOrderDir(value);
        const params: any = {};
        if (search) params.search = search;
        if (type && type !== 'all') params.type = type;
        if (currentFolder) params.folder = currentFolder.id;
        if (orderBy) params.order_by = orderBy;
        params.order_dir = value;
        router.get('/admin/media', params, { preserveState: true });
    };

    const navigateToFolder = (folderId: number | null) => {
        const params: any = {};
        if (folderId) params.folder = folderId;
        router.get('/admin/media', params, { preserveState: true });
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            setCreatingFolder(true);
            await axios.post('/admin/media/folders', {
                name: newFolderName,
                parent_id: currentFolder?.id || null,
            });
            setShowNewFolderDialog(false);
            setNewFolderName('');
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Folder created successfully.',
            });
            router.reload({ only: ['items'] });
        } catch (error: any) {
            console.error('Failed to create folder:', error);
            const errorMessage = error.response?.data?.error || 'Failed to create folder. Please try again.';
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMessage,
            });
        } finally {
            setCreatingFolder(false);
        }
    };

    const handleDeleteFolder = async () => {
        if (!folderToDelete) return;

        try {
            const response = await axios.delete(`/admin/media/folders/${folderToDelete.id}`);
            setFolderToDelete(null);
            
            if (response.data.success) {
                toast({
                    variant: 'success',
                    title: 'Success',
                    description: 'Folder deleted successfully.',
                });
                router.reload({ only: ['items'] });
            }
        } catch (error: any) {
            console.error('Failed to delete folder:', error);
            setFolderToDelete(null);
            const errorMessage = error.response?.data?.error || 'Failed to delete folder. Please try again.';
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMessage,
            });
        }
    };

    const handleDelete = () => {
        if (mediaToDelete) {
            router.delete(`/admin/media/${mediaToDelete.id}`, {
                onSuccess: () => setMediaToDelete(null),
            });
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            if (currentFolder) {
                formData.append('folder_id', currentFolder.id.toString());
            }

            try {
                setUploading(true);
                const response = await axios.post('/admin/media', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            : 0;
                        setUploadProgress(progress);
                    },
                });
                
                // Reload to get updated media list
                router.reload({ only: ['items'] });
            } catch (error) {
                console.error('Upload failed:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Upload failed. Please try again.',
                });
            } finally {
                setUploading(false);
                setUploadProgress(0);
            }
        }
    }, [currentFolder]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
            'video/*': ['.mp4', '.webm', '.ogg'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 10485760, // 10MB
    });

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <ImageIcon className="h-6 w-6" />;
        if (mimeType.startsWith('video/')) return <Video className="h-6 w-6" />;
        return <FileIcon className="h-6 w-6" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Media Library" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Media Library</h1>
                        <p className="text-muted-foreground mt-1">
                            Upload and manage your files
                        </p>
                    </div>
                    <Button onClick={() => setShowNewFolderDialog(true)}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        New Folder
                    </Button>
                </div>

                {/* Breadcrumbs */}
                {folderBreadcrumbs.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={() => navigateToFolder(null)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Root
                        </button>
                        {folderBreadcrumbs.map((crumb, index) => (
                            <div key={crumb.id} className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <button
                                    onClick={() => navigateToFolder(crumb.id)}
                                    className={
                                        index === folderBreadcrumbs.length - 1
                                            ? 'font-medium'
                                            : 'text-muted-foreground hover:text-foreground transition-colors'
                                    }
                                >
                                    {crumb.name}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Area */}
                <div
                    {...getRootProps()}
                    className={`relative overflow-hidden rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-sidebar-border/70 hover:border-primary/50'
                    }`}
                >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    {uploading ? (
                        <div className="space-y-2">
                            <p className="text-lg font-medium">Uploading... {uploadProgress}%</p>
                            <div className="w-full bg-muted rounded-full h-2 max-w-xs mx-auto">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    ) : isDragActive ? (
                        <p className="text-lg font-medium">Drop files here...</p>
                    ) : (
                        <div>
                            <p className="text-lg font-medium mb-1">
                                Drop files here or click to upload
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Images, videos, PDFs, and documents (max 10MB)
                            </p>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-4 flex-wrap">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-[300px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search files..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>
                    <div className="flex gap-2">
                        <Select value={type} onValueChange={handleTypeFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="image">Images</SelectItem>
                                <SelectItem value="video">Videos</SelectItem>
                                <SelectItem value="application">Documents</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={orderBy} onValueChange={handleOrderByChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="size">Size</SelectItem>
                                <SelectItem value="type">Type</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={orderDir} onValueChange={handleOrderDirChange}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascending</SelectItem>
                                <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Items Grid */}
                {items.data.length === 0 ? (
                    <div className="flex items-center justify-center h-64 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <p className="text-muted-foreground">No folders or files found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {items.data.map((item) => (
                            item.type === 'folder' ? (
                                <div
                                    key={`folder-${item.id}`}
                                    className="group relative overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border bg-card cursor-pointer hover:border-primary/50 transition-colors"
                                    onDoubleClick={() => navigateToFolder(item.id)}
                                >
                                    {/* Preview */}
                                    <div className="aspect-square bg-muted flex items-center justify-center">
                                        <FolderIcon className="h-12 w-12 text-primary" />
                                    </div>

                                    {/* Info */}
                                    <div className="p-2">
                                        <p className="text-xs font-medium truncate" title={item.name}>
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Folder
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFolderToDelete(item);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    key={`file-${item.id}`}
                                    className="group relative overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border bg-card"
                                >
                                    {/* Preview */}
                                    <div 
                                        className="aspect-square bg-muted flex items-center justify-center cursor-pointer"
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (item.mime_type.startsWith('image/')) {
                                                setPreviewImage(item);
                                            }
                                        }}
                                    >
                                        {item.mime_type.startsWith('image/') ? (
                                            <img
                                                src={item.url}
                                                alt={item.name}
                                                className="w-full h-full object-cover pointer-events-none"
                                            />
                                        ) : (
                                            <div className="text-muted-foreground">
                                                {getFileIcon(item.mime_type)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-2">
                                        <p className="text-xs font-medium truncate" title={item.file_name}>
                                            {item.file_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatBytes(item.size)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                                        {item.mime_type.startsWith('image/') && (
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => setPreviewImage(item)}
                                                className="pointer-events-auto"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <a
                                            href={`/admin/media/${item.id}/download`}
                                            download
                                            className="pointer-events-auto"
                                        >
                                            <Button variant="secondary" size="icon">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </a>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => setMediaToDelete(item)}
                                            className="pointer-events-auto"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {items.from || 0} to {items.to || 0} of {items.total} items
                    </p>
                    {items.last_page > 1 && (
                        <div className="flex gap-2">
                            {Array.from({ length: items.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === items.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams(window.location.search);
                                        params.set('page', page.toString());
                                        router.get(`/admin/media?${params.toString()}`);
                                    }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!mediaToDelete} onOpenChange={() => setMediaToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{mediaToDelete?.file_name}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Folder Confirmation Dialog */}
            <AlertDialog open={!!folderToDelete} onOpenChange={() => setFolderToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the folder <strong>{folderToDelete?.name}</strong> and all its contents including subfolders and files.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteFolder}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* New Folder Dialog */}
            <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>
                            Enter a name for the new folder.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateFolder}>
                        <div className="space-y-4 py-4">
                            <Input
                                placeholder="Folder name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowNewFolderDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={creatingFolder || !newFolderName.trim()}>
                                {creatingFolder ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Image Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={(open) => {
                if (!open) setPreviewImage(null);
            }}>
                <DialogContent className="max-w-7xl w-full">
                    <DialogHeader>
                        <DialogTitle>{previewImage?.file_name}</DialogTitle>
                        <DialogDescription>
                            {previewImage && `${formatBytes(previewImage.size)} • ${previewImage.created_at}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative w-full max-h-[85vh] overflow-auto bg-muted rounded-lg flex items-center justify-center">
                        {previewImage && (
                            <img
                                src={previewImage.url}
                                alt={previewImage.name}
                                className="max-w-full max-h-[85vh] h-auto object-contain"
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <a
                            href={previewImage ? `/admin/media/${previewImage.id}/download` : '#'}
                            download
                        >
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </a>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (previewImage) {
                                    setMediaToDelete(previewImage);
                                    setPreviewImage(null);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Button onClick={() => setPreviewImage(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
