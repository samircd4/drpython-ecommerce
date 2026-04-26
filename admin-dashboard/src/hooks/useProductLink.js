import toast from 'react-hot-toast';

const useProductLink = () => {
    const copyToClipboard = (slug, name) => {
        if (!slug) {
            toast.error('Product link not available (no slug found)');
            return;
        }
        const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'https://sarker.shop';
        const url = `${baseUrl}/products/${slug}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                toast.success(`Link for "${name || 'Product'}" copied to clipboard!`, {
                    icon: '🔗',
                    style: {
                        borderRadius: '10px',
                        background: '#0b1a2a',
                        color: '#fff',
                        border: '1px solid #1e293b'
                    },
                });
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                toast.error('Failed to copy link');
            });
    };

    return { copyToClipboard };
};

export default useProductLink;
