import { SelectionOption } from './types';

// Helper to create options from filenames
const createOptionsFromFiles = (files: Record<string, any>): SelectionOption[] => {
    return Object.keys(files).map(path => {
        const filename = path.split('/').pop()!.replace(/\.(png|jpg|jpeg|webp)$/, '');
        return {
            id: filename.toLowerCase().replace(/\s+/g, '-'),
            label: filename.toUpperCase(),
            imageUrl: files[path].default || files[path]
        };
    });
};

// Import all assets using Vite's glob import
const cameraFiles = import.meta.glob('../Assets/Camera Bodies/*.{png,jpg,jpeg,webp}', { eager: true });
const lensFiles = import.meta.glob('../Assets/Focal Length/*.{png,jpg,jpeg,webp}', { eager: true });
const genreFiles = import.meta.glob('../Assets/Photography Genre/*.{png,jpg,jpeg,webp}', { eager: true });
const photographerFiles = import.meta.glob('../Assets/Photographer Style/*.{png,jpg,jpeg,webp}', { eager: true });
const movieLookFiles = import.meta.glob('../Assets/Movie Look & Aesthetic/*.{png,jpg,jpeg,webp}', { eager: true });
const filterFiles = import.meta.glob('../Assets/Filter & Effect/*.{png,jpg,jpeg,webp}', { eager: true });
const filmStockFiles = import.meta.glob('../Assets/Film Stock/*.{png,jpg,jpeg,webp}', { eager: true });

export const CAMERA_OPTIONS = createOptionsFromFiles(cameraFiles);
export const LENS_OPTIONS = createOptionsFromFiles(lensFiles);
export const GENRE_OPTIONS = createOptionsFromFiles(genreFiles);
export const PHOTOGRAPHER_STYLE_OPTIONS = createOptionsFromFiles(photographerFiles);
export const MOVIE_LOOK_OPTIONS = createOptionsFromFiles(movieLookFiles);
export const FILTER_OPTIONS = createOptionsFromFiles(filterFiles);
export const FILM_STOCK_OPTIONS = createOptionsFromFiles(filmStockFiles);

// Keep existing manual options for Shot Type, Angle, and Lighting
export const SHOT_TYPE_OPTIONS: SelectionOption[] = [
    { id: 'closeup', label: 'CLOSE UP', description: 'Tight focus on subject detail', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
    { id: 'medium', label: 'MEDIUM SHOT', description: 'Standard narrative framing', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
    { id: 'wide', label: 'WIDE SHOT', description: 'Subject in environment', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400' },
    { id: 'cinematic-wide', label: 'CINEMATIC WIDE', description: 'Epic landscape framing', imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400' },
    { id: 'pov', label: 'POV', description: 'Point of view perspective', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400' },
];

export const ANGLE_OPTIONS: SelectionOption[] = [
    { id: 'eyelevel', label: 'EYE LEVEL', description: 'Neutral perspective', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' },
    { id: 'low', label: 'LOW ANGLE', description: 'Looking up, heroic feel', imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400' },
    { id: 'high', label: 'HIGH ANGLE', description: 'Looking down perspective', imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=400' },
    { id: 'dutch', label: 'DUTCH ANGLE', description: 'Tilted horizon for tension', imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400' },
    { id: 'birdseye', label: 'BIRD\'S EYE', description: 'Extreme top-down view', imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abb99d4fe3?auto=format&fit=crop&q=80&w=400' },
];

export const LIGHTING_OPTIONS: SelectionOption[] = [
    { id: 'natural', label: 'NATURAL LIGHT', description: 'Soft daylight through window', imageUrl: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400' },
    { id: 'golden', label: 'GOLDEN HOUR', description: 'Warm sunset lighting', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400' },
    { id: 'blue', label: 'BLUE HOUR', description: 'Cool twilight ambient light', imageUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=400' },
    { id: 'hard', label: 'HARD LIGHTING', description: 'Sharp shadows, defined edges', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=80&w=400' },
    { id: 'soft', label: 'SOFT LIGHTING', description: 'Diffused, gentle illumination', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' },
    { id: 'volumetric', label: 'VOLUMETRIC LIGHTING', description: 'Light rays through atmosphere', imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abb99d4fe3?auto=format&fit=crop&q=80&w=400' },
    { id: 'neon', label: 'NEON GLOW', description: 'Colorful neon light on face', imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400' },
    { id: 'chiaroscuro', label: 'CHIAROSCURO LIGHTING', description: 'Strong contrast of light and shadow', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400' },
];

export const LENS_TYPE_OPTIONS: SelectionOption[] = [
    { id: 'spherical', label: 'SPHERICAL', description: 'Classic clean optics', imageUrl: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&q=80&w=400' },
    { id: 'anamorphic', label: 'ANAMORPHIC', description: 'Widescreen look & flare', imageUrl: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?auto=format&fit=crop&q=80&w=400' },
];
