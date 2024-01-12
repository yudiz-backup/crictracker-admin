import { FETCH_PLAYLIST_URL } from 'shared/constants'

export const syncVideos = async () => {
  return fetch(FETCH_PLAYLIST_URL, {
    method: 'get',
    headers: { authorization: localStorage.getItem('token') }
  })
}
