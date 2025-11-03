import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Image, Search, X, Folder, ChevronRight } from 'lucide-react';

interface MediaItem {
    type: 'file' | 'folder';
    id: number;
    name: string;
    file_name?: string;
    url?: string;
    mime_type?: string;
    parent_id?: number | null;
}

interface Breadcrumb {
    id: number;
    name: string;
}

interface CurrentFolder {
    id: number;
    name: string;
    parent_id: number | null;
}

interface MediaSelectorProps {
    selectedImageId?: number | null;
    selectedImageUrl?: string | null;
    onSelect: (imageId: number, imageUrl: string) => void;
    onClear: () => void;
}

export function MediaSelector({ selectedImageId, selectedImageUrl, onSelect, onClear }: MediaSelectorProps) {
    const [open, setOpen] = useState(false);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [orderBy, setOrderBy] = useState('name');
    const [orderDir, setOrderDir] = useState('asc');
    const [currentFolder, setCurrentFolder] = useState<CurrentFolder | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

    const fetchMedia = async (folderId?: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (folderId) params.append('folder', folderId.toString());
            if (search) params.append('search', search);
            params.append('order_by', orderBy);
            params.append('order_dir', orderDir);
            
            const response = await fetch(`/admin/media/api?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            
            const result = await response.json();
            setMedia(result.data || []);
            setCurrentFolder(result.currentFolder || null);
            setBreadcrumbs(result.breadcrumbs || []);
        } catch (error) {
            console.error('Error fetching media:', error);
            setMedia([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchMedia(currentFolder?.id);
        }
    }, [open, search, orderBy, orderDir]);

    const handleFolderClick = (folderId: number) => {
        fetchMedia(folderId);
    };

    const handleBreadcrumbClick = (folderId?: number) => {
        fetchMedia(folderId);
    };

    const handleSelect = (item: MediaItem) => {
        if (item.type === 'folder') {
            handleFolderClick(item.id);
        } else if (item.url) {
            onSelect(item.id, item.url);
            setOpen(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                {selectedImageUrl ? (
                    <div className="relative group">
                        <img
                            src={selectedImageUrl}
                            alt="Selected"
                            className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setOpen(true)}
                            >
                                Change
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={onClear}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(true)}
                        className="w-32 h-32 flex flex-col gap-2"
                    >
                        <Image className="h-8 w-8" />
                        <span className="text-xs">Select Image</span>
                    </Button>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Select Image from Media Library</DialogTitle>
                        <DialogDescription>
                            Choose an image from your media library
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                        {/* Breadcrumbs */}
                        {breadcrumbs.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <button
                                    onClick={() => handleBreadcrumbClick()}
                                    className="hover:text-foreground"
                                >
                                    Media
                                </button>
                                {breadcrumbs.map((crumb, index) => (
                                    <div key={crumb.id} className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4" />
                                        <button
                                            onClick={() => handleBreadcrumbClick(crumb.id)}
                                            className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground'}
                                        >
                                            {crumb.name}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search and Filters */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search images..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={orderBy} onValueChange={setOrderBy}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="size">Size</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={orderDir} onValueChange={setOrderDir}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">Asc</SelectItem>
                                    <SelectItem value="desc">Desc</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Media Grid */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <p className="text-muted-foreground">Loading...</p>
                                </div>
                            ) : media.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <Image className="h-12 w-12 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No images found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-4">
                                    {media.map((item) => (
                                        <button
                                            key={`${item.type}-${item.id}`}
                                            type="button"
                                            onClick={() => handleSelect(item)}
                                            className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-primary ${
                                                item.type === 'file' && selectedImageId === item.id
                                                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            {item.type === 'folder' ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                                                    <Folder className="h-12 w-12 text-muted-foreground mb-2" />
                                                    <span className="text-sm font-medium px-2 text-center line-clamp-2">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <img
                                                        src={item.url}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-sm font-medium">
                                                            Select
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
