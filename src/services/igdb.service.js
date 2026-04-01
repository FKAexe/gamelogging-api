import axios from 'axios';

let accessToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 min before expiry

  return accessToken;
};

const makeRequest = async (endpoint, body) => {
  const token = await getAccessToken();

  try {
    const response = await axios.post(
      `https://api.igdb.com/v4/${endpoint}`,
      body,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const searchGames = async (query, limit = 20) => {
  const body = `
    search "${query}";
    fields id, name, cover.url, first_release_date, summary, rating, rating_count;
    limit ${limit};
  `;

  const games = await makeRequest('games', body);

  return games
    .sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0))
    .map(game => ({
      id: game.id,
      name: game.name,
      cover: game.cover ? game.cover.url.replace('t_thumb', 't_cover_big') : null,
      release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
      summary: game.summary || null,
      rating: game.rating ? Math.round(game.rating) : null,
      rating_count: game.rating_count || 0
    }));
};

export const getGameById = async (id) => {
  const body = `
    fields id, name, cover.url, first_release_date, summary, storyline, rating, rating_count,
           genres.name, platforms.name, involved_companies.company.name, involved_companies.developer;
    where id = ${id};
  `;

  const games = await makeRequest('games', body);

  if (!games || games.length === 0) {
    return null;
  }

  const game = games[0];
  const developers = game.involved_companies
    ?.filter(ic => ic.developer)
    .map(ic => ic.company.name) || [];

  return {
    id: game.id,
    name: game.name,
    cover: game.cover ? game.cover.url.replace('t_thumb', 't_cover_big') : null,
    release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
    summary: game.summary || null,
    storyline: game.storyline || null,
    rating: game.rating ? Math.round(game.rating) : null,
    rating_count: game.rating_count || 0,
    genres: game.genres?.map(g => g.name) || [],
    platforms: game.platforms?.map(p => p.name) || [],
    developers
  };
};

export const getGamesByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const body = `
    fields id, name, cover.url, first_release_date, summary, rating;
    where id = (${ids.join(',')});
    limit ${ids.length};
  `;

  const games = await makeRequest('games', body);

  return games.map(game => ({
    id: game.id,
    name: game.name,
    cover: game.cover ? game.cover.url.replace('t_thumb', 't_cover_big') : null,
    release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
    summary: game.summary || null,
    rating: game.rating ? Math.round(game.rating) : null
  }));
};

export const getGenres = async () => {
  const body = `
    fields id, name, slug;
    limit 50;
  `;

  const genres = await makeRequest('genres', body);
  return genres.sort((a, b) => a.name.localeCompare(b.name));
};

export const getGamesByGenre = async (genreId, limit = 20, offset = 0) => {
  const body = `
    fields id, name, cover.url, first_release_date, summary, rating, rating_count;
    where genres = (${genreId}) & cover != null & rating_count > 50;
    sort rating_count desc;
    limit ${limit};
    offset ${offset};
  `;

  const games = await makeRequest('games', body);

  return games.map(game => ({
    id: game.id,
    name: game.name,
    cover: game.cover ? game.cover.url.replace('t_thumb', 't_cover_big') : null,
    release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
    summary: game.summary || null,
    rating: game.rating ? Math.round(game.rating) : null,
    rating_count: game.rating_count || 0
  }));
};

export const getPopularGames = async (limit = 20) => {
  const body = `
    fields id, name, cover.url, first_release_date, summary, rating, rating_count, total_rating;
    where rating_count > 200 & cover != null;
    sort total_rating desc;
    limit ${limit};
  `;

  const games = await makeRequest('games', body);

  return games.map(game => ({
    id: game.id,
    name: game.name,
    cover: game.cover ? game.cover.url.replace('t_thumb', 't_cover_big') : null,
    release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
    summary: game.summary || null,
    rating: game.rating ? Math.round(game.rating) : null,
    rating_count: game.rating_count || 0
  }));
};

export const getTrendingGames = async (limit = 20) => {
  const sixMonthsAgo = Math.floor(Date.now() / 1000) - (180 * 24 * 60 * 60);

  const body = `
    fields id, name, cover.url, first_release_date, summary, rating, rating_count;
    where first_release_date > ${sixMonthsAgo} & cover != null & rating_count > 5;
    sort rating_count desc;
    limit ${limit};
  `;

  const games = await makeRequest('games', body);

  return games.map(game => ({
    id: game.id,
    name: game.name,
    cover: game.cover ? game.cover.url.replace('t_thumb', 't_cover_big') : null,
    release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
    summary: game.summary || null,
    rating: game.rating ? Math.round(game.rating) : null,
    rating_count: game.rating_count || 0
  }));
};

export const getUpcomingGames = async (limit = 20) => {
  const now = Math.floor(Date.now() / 1000);

  const body = `
    fields id, name, cover.url, first_release_date, summary, hypes;
    where first_release_date > ${now} & cover != null & hypes > 1;
    sort hypes desc;
    limit ${limit};
  `;

  const games = await makeRequest('games', body);

  return games.map(game => ({
    id: game.id,
    name: game.name,
    cover: game.cover ? game.cover.url.replace('t_thumb', 't_cover_big') : null,
    release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
    summary: game.summary || null,
    hypes: game.hypes || 0
  }));
};

export default {
  searchGames,
  getGameById,
  getGamesByIds,
  getGenres,
  getGamesByGenre,
  getPopularGames,
  getTrendingGames,
  getUpcomingGames
};
