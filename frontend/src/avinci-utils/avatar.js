export const getFallbackAvatar = (name = 'Persona', options = {}) => {
    const background = options.background || '6366f1';
    const color = options.color || 'fff';
    const size = options.size || 240;
    const bold = options.bold !== false;

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=${color}&size=${size}${bold ? '&bold=true' : ''}`;
};

export const getAvatarSrc = (avatarUrl, name = 'Persona', options = {}) => {
    if (!avatarUrl || typeof avatarUrl !== 'string') {
        return getFallbackAvatar(name, options);
    }

    const trimmed = avatarUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // Handle relative paths by prefixing with origin
    if (trimmed.startsWith('/')) {
        return `${window.location.origin}${trimmed}`;
    }

    return getFallbackAvatar(name, options);
};

export const handleAvatarError = (event, name = 'Persona', options = {}) => {
    if (!event?.target) return;
    event.target.onerror = null;
    event.target.src = getFallbackAvatar(name, options);
};
