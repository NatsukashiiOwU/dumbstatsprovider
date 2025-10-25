/**
 * API utility functions for making requests to OverStats API
 * Handles CORS configuration and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FetchOptions extends RequestInit {
    timeout?: number;
}

/**
 * Get match details
 */
export async function getMatch(matchId: string) {
    const res = await fetch(`${API_BASE_URL}/match/${matchId}`);
    if (!res.ok) throw new Error(`Failed to fetch match: ${res.status}`);
    return res.json();
}

/**
 * Get overall match statistics
 */

export async function getOverallStats(matchId: string) {
    const res = await fetch(`${API_BASE_URL}/stats/${matchId}/overall`);
    if (!res.ok) throw new Error(`Failed to fetch overall stats: ${res.status}`);
    return res.json();
}

/**
 * Get match settings
 */
export async function getMatchSettings(matchId: string) {
    const res = await fetch(`${API_BASE_URL}/settings/match/${matchId}`);
    if (!res.ok) throw new Error(`Failed to fetch match settings: ${res.status}`);
    return res.json();
}

/**
 * Get game statistics for a specific game number
 */
export async function getGameStats(matchId: string, gameNumber: string) {
    const res = await fetch(`${API_BASE_URL}/stats/${matchId}/${gameNumber}`);
    if (!res.ok) throw new Error(`Failed to fetch game stats: ${res.status}`);
    return res.json();
}

/**
 * Get match list for organizer
 */
export async function getMatchList(organizer: string) {
    const res = await fetch(`${API_BASE_URL}/settings/match_list/${organizer}`);
    if (!res.ok) throw new Error(`Failed to fetch match list: ${res.status}`);
    return res.json();
}

/**
 * Get team list for a match
 */
export async function getMatchTeams(matchId: string) {
    const res = await fetch(`${API_BASE_URL}/settings/match/${matchId}/teams`);
    if (!res.ok) throw new Error(`Failed to fetch match teams: ${res.status}`);
    return res.json();
}

/**
 * Get draft/drop data for a specific match, map, and game
 */
export async function getDrops(matchId: string, map: string, game: string) {
    const res = await fetch(`${API_BASE_URL}/drops/${matchId}/${map}/${game}`);
    if (!res.ok) throw new Error(`Failed to fetch drops: ${res.status}`);
    return res.json();
}

/**
 * Generic API request function for custom endpoints
 */
export async function apiRequest(endpoint: string, options: FetchOptions = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    return await fetch(url, options);
}
