import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from '@/hooks/use-toast';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export function useFlashMessages() {
    const { props } = usePage<{ flash?: FlashMessages }>();
    const flash = props.flash;

    useEffect(() => {
        if (flash?.success) {
            toast({
                variant: 'success',
                title: 'Success',
                description: flash.success,
            });
        }

        if (flash?.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: flash.error,
            });
        }

        if (flash?.warning) {
            toast({
                variant: 'default',
                title: 'Warning',
                description: flash.warning,
            });
        }

        if (flash?.info) {
            toast({
                variant: 'default',
                title: 'Info',
                description: flash.info,
            });
        }
    }, [flash]);
}
