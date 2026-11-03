import { useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getRegionColors } from '../utils/calculate';
import { NAME_TO_ID } from '../data/constants';
import 'leaflet/dist/leaflet.css';
import russiaGeoJson from '../data/russia.json'; 

// Создаем свой рендерер Canvas с буфером (чтобы он рисовал области с запасом за пределами экрана)
const canvasRenderer = L.canvas({ padding: 0.5 });

function MapSettings() {
  const map = useMap();

  useEffect(() => {
    if (!russiaGeoJson) return;

    const geoJsonLayer = L.geoJSON(russiaGeoJson);
    const bounds = geoJsonLayer.getBounds();
    
    // Добавляем отступ 5%, чтобы при перетаскивании карта не упиралась в самый край
    const paddedBounds = bounds.pad(0.05);

    map.fitBounds(bounds, { padding: [20, 20] });
    map.setMaxBounds(paddedBounds);
    
    // Ограничиваем зум
    map.setMinZoom(map.getBoundsZoom(bounds));
    map.setMaxZoom(7);

    geoJsonLayer.remove();
  }, [map]);

  return null;
}

function CustomZoomControl() {
  const map = useMap();
  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col bg-panel-dark border border-slate-700 rounded-lg overflow-hidden shadow-xl">
      <button onClick={() => map.zoomIn()} className="w-10 h-10 flex items-center justify-center text-xl font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border-b border-slate-700">+</button>
      <button onClick={() => map.zoomOut()} className="w-10 h-10 flex items-center justify-center text-xl font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">−</button>
    </div>
  );
}

export default function Map({ scenarioData, onRegionClick }) {
  const colorMap = getRegionColors(scenarioData);

  const styleFeature = (feature) => {
    const id = NAME_TO_ID[feature.properties.name];
    
    if (id && colorMap[id]) {
      return {
        fillColor: colorMap[id],
        weight: 1,
        opacity: 1,
        color: '#475569',
        fillOpacity: 0.9
      };
    }

    return {
      fillColor: '#1e293b',
      weight: 1,
      opacity: 1,
      color: '#475569',
      fillOpacity: 1
    };
  };

  const onEachFeature = (feature, layer) => {
    const id = NAME_TO_ID[feature.properties.name];
    
    if (id) {
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({ weight: 2, color: '#ffffff' });
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle(styleFeature(feature));
        },
        click: () => {
          onRegionClick(id);
        }
      });
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={[62, 95]} 
        zoom={3} 
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, backgroundColor: '#0f172a' }}
        zoomControl={false}
        attributionControl={false}
        maxBoundsViscosity={1.0}
        preferCanvas={true}
        zoomSnap={0.1}
        // ОТКЛЮЧАЕМ АНИМАЦИИ ДЛЯ ПЛАВНОСТИ:
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
          renderer={canvasRenderer} // ПЕРЕДАЕМ НАШ БУФЕРНЫЙ РЕНДЕРЕР
        />
      </MapContainer>
    </div>
  );
}