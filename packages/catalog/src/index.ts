/**
 * @commonscene/catalog — Fictional Movie Catalog and Accessors.
 *
 * All catalog entries are strictly fictional and use project-owned identifiers
 * and original metadata in accordance with AGENTS.md rules.
 */

import { type Movie, MovieSchema } from '@commonscene/contracts';

export const FICTIONAL_CATALOG: Movie[] = [
    {
        id: 'cs-mov-001',
        title: 'Starlight Odyssey',
        synopsis:
            'A brave crew embarks on an uncharted journey across the cosmos to discover the lost beacon of humanity.',
        runtimeMinutes: 118,
        releaseYear: 2024,
        genres: ['Sci-Fi', 'Adventure'],
        moods: ['thrilling', 'epic', 'inspiring'],
        contentRating: 'PG',
        contentTags: ['space exploration', 'mild perils'],
        artworkKey: 'art_starlight_odyssey',
    },
    {
        id: 'cs-mov-002',
        title: 'The Clockwork Bakery',
        synopsis:
            'In a bustling Victorian town, a gentle clockmaker and his apprentice invent whimsical pastries that grant joyful wishes.',
        runtimeMinutes: 94,
        releaseYear: 2023,
        genres: ['Family', 'Comedy', 'Fantasy'],
        moods: ['lighthearted', 'heartwarming', 'whimsical'],
        contentRating: 'G',
        contentTags: ['baking', 'magic', 'family-friendly'],
        artworkKey: 'art_clockwork_bakery',
    },
    {
        id: 'cs-mov-003',
        title: 'Shadows of the Neon Rain',
        synopsis:
            'A brilliant cyber-detective navigates neon-lit alleyways to solve a high-stakes conspiracy threatening the digital metropolis.',
        runtimeMinutes: 126,
        releaseYear: 2025,
        genres: ['Mystery', 'Sci-Fi', 'Thriller'],
        moods: ['moody', 'suspenseful', 'clever'],
        contentRating: 'PG-13',
        contentTags: ['cyberpunk', 'investigation', 'intense action'],
        artworkKey: 'art_neon_rain',
    },
    {
        id: 'cs-mov-004',
        title: 'Whimsical Whispers',
        synopsis:
            'A young forest sprite embarks on a musical quest with talking woodland creatures to restore harmony to the enchanted grove.',
        runtimeMinutes: 88,
        releaseYear: 2024,
        genres: ['Animation', 'Family', 'Musical'],
        moods: ['joyful', 'uplifting', 'whimsical'],
        contentRating: 'G',
        contentTags: ['cute animals', 'musical numbers', 'enchanted forest'],
        artworkKey: 'art_whimsical_whispers',
    },
    {
        id: 'cs-mov-005',
        title: 'Deep Blue Horizon',
        synopsis:
            'An immersive underwater expedition documenting luminous coral reefs, bioluminescent ocean trenches, and majestic sea creatures.',
        runtimeMinutes: 75,
        releaseYear: 2023,
        genres: ['Documentary', 'Adventure'],
        moods: ['relaxing', 'awe-inspiring', 'educational'],
        contentRating: 'PG',
        contentTags: ['marine life', 'ocean scenery', 'nature'],
        artworkKey: 'art_deep_blue_horizon',
    },
    {
        id: 'cs-mov-006',
        title: "Chef's Dilemma",
        synopsis:
            'Two rival culinary maestros are forced to co-run a boutique bistro on the Amalfi Coast during the annual food festival.',
        runtimeMinutes: 102,
        releaseYear: 2024,
        genres: ['Comedy', 'Romance'],
        moods: ['witty', 'feel-good', 'romantic'],
        contentRating: 'PG-13',
        contentTags: ['cooking', 'rivalry', 'romance'],
        artworkKey: 'art_chefs_dilemma',
    },
    {
        id: 'cs-mov-007',
        title: 'The Forgotten Realm',
        synopsis:
            'An intrepid cartographer uncovers a hidden portal leading to an ancient sky kingdom inhabited by legendary mythical beings.',
        runtimeMinutes: 134,
        releaseYear: 2025,
        genres: ['Fantasy', 'Adventure'],
        moods: ['epic', 'mysterious', 'dramatic'],
        contentRating: 'PG-13',
        contentTags: ['mythical creatures', 'ancient lore', 'sword fights'],
        artworkKey: 'art_forgotten_realm',
    },
    {
        id: 'cs-mov-008',
        title: 'Haunted Hearth',
        synopsis:
            'A historian spending winter in an ancestral manor unravels century-old supernatural puzzles hidden within the locked library.',
        runtimeMinutes: 98,
        releaseYear: 2023,
        genres: ['Horror', 'Mystery'],
        moods: ['scary', 'chilling', 'eerie'],
        contentRating: 'PG-13',
        contentTags: ['haunted house', 'ghosts', 'dark secrets'],
        artworkKey: 'art_haunted_hearth',
    },
    {
        id: 'cs-mov-009',
        title: 'Rhythm & Rescue',
        synopsis:
            'A group of energetic teenage dance champions stumble across an animal shelter in need and organize a citywide benefit showdown.',
        runtimeMinutes: 105,
        releaseYear: 2024,
        genres: ['Action', 'Family', 'Comedy'],
        moods: ['energetic', 'exciting', 'heroic'],
        contentRating: 'PG',
        contentTags: ['dance battles', 'teamwork', 'friendship'],
        artworkKey: 'art_rhythm_rescue',
    },
    {
        id: 'cs-mov-010',
        title: 'Midnight in Monaco',
        synopsis:
            'A suave art restorer and an elusive investigator team up to prevent a brazen diamond heist along the French Riviera.',
        runtimeMinutes: 110,
        releaseYear: 2025,
        genres: ['Thriller', 'Action', 'Mystery'],
        moods: ['sophisticated', 'tense', 'clever'],
        contentRating: 'PG-13',
        contentTags: ['heist', 'luxury', 'twists'],
        artworkKey: 'art_midnight_monaco',
    },
];

// Validate all entries against MovieSchema at module initialization
for (const movie of FICTIONAL_CATALOG) {
    MovieSchema.parse(movie);
}

/**
 * Returns a copy of the entire fictional movie catalog.
 */
export function getCatalog(): Movie[] {
    return [...FICTIONAL_CATALOG];
}

/**
 * Retrieves a movie by its catalog ID, or undefined if not found.
 */
export function getMovieById(id: string): Movie | undefined {
    return FICTIONAL_CATALOG.find((m) => m.id === id);
}
