import { useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getRegionColors } from '../utils/calculate';
import { NAME_TO_ID } from '../data/constants';
import 'leaflet/dist/leaflet.css';
import russiaGeoJson from '../data/russia.json';

const canvasRenderer = L.canvas({ padding: 0.5 });

function MapSettings() {
  const map = useMap();

  useEffect(() => {
    if (!russiaGeoJson) return;
    const geoJsonLayer = L.geoJSON(russiaGeoJson);
    const bounds = geoJsonLayer.getBounds();
    const seaBounds = bounds.pad(0.095);

    // Leave a visible ocean margin around the country, while keeping the map draggable.
    map.fitBounds(seaBounds, { padding: [8, 12] });
    map.setMaxBounds(bounds.pad(0.19));
    map.setMinZoom(map.getBoundsZoom(seaBounds));
    map.setMaxZoom(7);
    geoJsonLayer.remove();
  }, [map]);

  return null;
}

function CustomZoomControl() {
  const map = useMap();
  return (
    <div className="map-zoom-control">
      <button type="button" aria-label="Увеличить карту" onClick={() => map.zoomIn()}>+</button>
      <button type="button" aria-label="Уменьшить карту" onClick={() => map.zoomOut()}>−</button>
    </div>
  );
}

function OceanWaves() {
  return (
    <svg className="ocean-waves" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="seaTint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A3B55" />
          <stop offset="0.55" stopColor="#0C5470" />
          <stop offset="1" stopColor="#082E49" />
        </linearGradient>
        <pattern id="wavePattern" width="170" height="74" patternUnits="userSpaceOnUse">
          <path d="M-30 22 C-8 8 12 8 34 22 S76 36 98 22 S140 8 162 22" fill="none" stroke="#D8F2FF" strokeOpacity=".16" strokeWidth="1.3" />
          <path d="M8 53 C28 40 48 40 68 53 S108 66 128 53 S168 40 188 53" fill="none" stroke="#B9E9F9" strokeOpacity=".1" strokeWidth="1" />
        </pattern>
        <radialGradient id="seaGlow" cx="50%" cy="45%" r="65%">
          <stop offset="0" stopColor="#2A7892" stopOpacity=".18" />
          <stop offset="1" stopColor="#061A31" stopOpacity=".4" />
        </radialGradient>
      </defs>
      <rect width="1200" height="700" fill="url(#seaTint)" />
      <rect width="1200" height="700" fill="url(#wavePattern)" />
      <rect width="1200" height="700" fill="url(#seaGlow)" />
      <g fill="none" stroke="#E4F7FF" strokeOpacity=".2" strokeWidth="1.4">
        <path d="M0 115 C55 95 82 130 134 113 S215 95 262 116" />
        <path d="M0 130 C58 110 84 145 137 128 S216 110 264 131" />
        <path d="M850 88 C895 68 935 99 980 82 S1080 66 1200 94" />
        <path d="M862 105 C908 86 945 117 992 100 S1082 85 1200 112" />
        <path d="M0 595 C44 577 80 606 122 591 S205 574 248 596" />
        <path d="M930 625 C976 606 1015 638 1062 619 S1145 603 1200 624" />
      </g>
    </svg>
  );
}

function MaritimeDecorations() {
  return (
    <svg className="maritime-decorations" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="softGlow"><feGaussianBlur stdDeviation="2.2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {/* Tiny vessel in the western sea */}
      <g className="ship ship-west" transform="translate(72 335) scale(.82)" opacity=".9">
        <path d="M-27 8 L25 8 L16 20 L-17 20 Z" fill="#EAF7FA" stroke="#75CFE0" strokeWidth="1.6" />
        <path d="M-8 7 L-8 -8 L7 -8 L7 7 Z" fill="#D1E8EF" />
        <path d="M-2 -8 L-2 -20 L11 -8" fill="none" stroke="#F5FCFF" strokeWidth="2" />
        <path d="M-31 26 Q-18 21 -5 26 T21 26 T43 26" fill="none" stroke="#DDF8FF" strokeOpacity=".8" strokeWidth="1.8" />
      </g>
      {/* Second vessel near the Pacific side */}
      <g className="ship ship-east" transform="translate(1082 465) scale(.7)" opacity=".86">
        <path d="M-29 8 L27 8 L15 21 L-18 21 Z" fill="#EAF7FA" stroke="#75CFE0" strokeWidth="1.6" />
        <path d="M-8 7 L-8 -8 L9 -8 L9 7 Z" fill="#D1E8EF" />
        <path d="M-2 -8 L-2 -21 L12 -8" fill="none" stroke="#F5FCFF" strokeWidth="2" />
        <path d="M-34 27 Q-20 22 -6 27 T22 27 T46 27" fill="none" stroke="#DDF8FF" strokeOpacity=".8" strokeWidth="1.8" />
      </g>
      {/* Animated aircraft and a fine contrail */}
      <path d="M775 128 C825 115 865 99 915 78" fill="none" stroke="#E9F8FF" strokeOpacity=".58" strokeWidth="1.6" strokeDasharray="5 7" />
      <g className="map-aircraft" filter="url(#softGlow)">
        <g transform="translate(0 0) rotate(-11 0 0)">
          <path d="M0 0 L18 -4 L37 -21 L43 -20 L34 -3 L59 3 L59 7 L32 7 L23 18 L18 18 L21 6 L0 5 Z" fill="#F1FBFF" stroke="#92D9EB" strokeWidth="1.2" />
          <path d="M19 0 L35 1" stroke="#6CC8DF" strokeWidth="1" />
        </g>
      </g>
    </svg>
  );
}

export default function Map({ scenarioData, onRegionClick }) {
  const colorMap = getRegionColors(scenarioData);

  const styleFeature = (feature) => {
    const id = NAME_TO_ID[feature.properties.name];
    if (id && colorMap[id]) {
      return {
        fillColor: colorMap[id],
        weight: 1.15,
        opacity: 1,
        color: '#60768B',
        fillOpacity: 0.96,
      };
    }
    return {
      fillColor: '#CAD5DF',
      weight: 0.8,
      opacity: 1,
      color: '#8095A8',
      fillOpacity: 0.94,
    };
  };

  const onEachFeature = (feature, layer) => {
    const id = NAME_TO_ID[feature.properties.name];
    if (id) {
      layer.on({
        mouseover: (event) => event.target.setStyle({ weight: 2.2, color: '#F3FBFF', fillOpacity: 1 }),
        mouseout: (event) => event.target.setStyle(styleFeature(feature)),
        click: () => onRegionClick(id),
      });
    }
  };

  return (
    <div className="map-canvas-wrap">
      <OceanWaves />
      <MapContainer
        center={[62, 95]}
        zoom={3}
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, backgroundColor: 'transparent' }}
        zoomControl={false}
        attributionControl={false}
        maxBoundsViscosity={0.92}
        preferCanvas={true}
        zoomSnap={0.1}
        zoomAnimation={false}
        fadeAnimation={false}
        inertia={false}
      >
        <MapSettings />
        <CustomZoomControl />
        <GeoJSON
          key={JSON.stringify(colorMap)}
          data={russiaGeoJson}
          style={styleFeature}
          onEachFeature={onEachFeature}
          renderer={canvasRenderer}
        />
      </MapContainer>
      <MaritimeDecorations />
    </div>
  );
}
