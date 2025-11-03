import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Users, UserCog, User, FolderTree, Tag, Image } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin',
    },
];

interface Props {
    stats: {
        total_users: number;
        admin_users: number;
        regular_users: number;
        total_categories: number;
        active_categories: number;
        total_tags: number;
        active_tags: number;
        total_media: number;
    };
}

export default function AdminDashboard({ stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Welcome to the blog administration panel</p>
                </div>

                {/* User Stats */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-muted-foreground">Users Overview</h2>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-primary/10">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                                    <p className="text-3xl font-bold">{stats.total_users}</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-blue-500/10">
                                    <UserCog className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">Admin Users</h3>
                                    <p className="text-3xl font-bold">{stats.admin_users}</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-green-500/10">
                                    <User className="h-6 w-6 text-green-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">Regular Users</h3>
                                    <p className="text-3xl font-bold">{stats.regular_users}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Stats */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-muted-foreground">Content Overview</h2>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <Link href="/admin/categories" className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 hover:bg-sidebar-accent transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-purple-500/10">
                                    <FolderTree className="h-6 w-6 text-purple-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                                    <p className="text-3xl font-bold">{stats.total_categories}</p>
                                    <p className="text-xs text-muted-foreground">{stats.active_categories} active</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/admin/tags" className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 hover:bg-sidebar-accent transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-orange-500/10">
                                    <Tag className="h-6 w-6 text-orange-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                                    <p className="text-3xl font-bold">{stats.total_tags}</p>
                                    <p className="text-xs text-muted-foreground">{stats.active_tags} active</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/admin/media" className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 hover:bg-sidebar-accent transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-cyan-500/10">
                                    <Image className="h-6 w-6 text-cyan-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">Media Files</h3>
                                    <p className="text-3xl font-bold">{stats.total_media}</p>
                                    <p className="text-xs text-muted-foreground">Total uploads</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                            <p>No posts yet</p>
                        </div>
                    </div>
                    <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6">
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="flex flex-col gap-3 relative z-10">
                            <Link href="/admin/posts/create" className="px-4 py-3 rounded-lg border border-sidebar-border/70 hover:bg-sidebar-accent transition-colors">
                                Create New Post
                            </Link>
                            <Link href="/admin/categories/create" className="px-4 py-3 rounded-lg border border-sidebar-border/70 hover:bg-sidebar-accent transition-colors">
                                Add Category
                            </Link>
                            <Link href="/admin/tags/create" className="px-4 py-3 rounded-lg border border-sidebar-border/70 hover:bg-sidebar-accent transition-colors">
                                Add Tag
                            </Link>
                            <Link href="/admin/media" className="px-4 py-3 rounded-lg border border-sidebar-border/70 hover:bg-sidebar-accent transition-colors">
                                Upload Media
                            </Link>
                            <Link href="/admin/users" className="px-4 py-3 rounded-lg border border-sidebar-border/70 hover:bg-sidebar-accent transition-colors">
                                Manage Users
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
