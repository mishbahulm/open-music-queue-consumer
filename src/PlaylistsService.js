const { Pool } = require('pg');

class PlaylistsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async getPlaylistSongById(playlistId) {
    try {
      // mendapatkan catatan dari cache
      const result = await this._cacheService.get(`playlists:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs
        LEFT JOIN songs ON playlistsongs.song_id = songs.id
        WHERE playlistsongs.playlist_id = $1`,
        values: [playlistId],
      };
      const result = await this._pool.query(query);

      // catatan akan disimpan pada cache sebelum fungsi getPlaylistSongById dikembalikan
      await this._cacheService.set(`playlists:${playlistId}`, JSON.stringify(result.rows));

      return result.rows;
    }
  }
}

module.exports = PlaylistsService;
