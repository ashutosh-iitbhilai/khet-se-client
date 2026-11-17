import L from 'leaflet';

/** Square brand pin as an inline SVG divIcon (avoids Leaflet's default image-path issues). */
export const farmPinIcon = L.divIcon({
  className: '',
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 1h32v30H22l-5 12-5-12H1z" fill="#2F6B3B" stroke="#fff" stroke-width="2"/>
    <path d="M10 22c0-6 3-9 13-11-1 7-4 11-13 11Zm0 0 7-7" stroke="#fff" stroke-width="2" fill="none"/>
  </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
});

/** Small square marker for the customer's own location. */
export const homePinIcon = L.divIcon({
  className: '',
  html: `<span style="display:block;width:16px;height:16px;background:#C98A1B;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
