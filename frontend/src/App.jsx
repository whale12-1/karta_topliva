import { useState, useEffect } from 'react';
import Map from './components/Map';
import { fetchRegions, fetchScenario } from './api';
import { getSortedRegions } from './utils/calculate';
import { RANK_COLORS } from './data/constants';

// --- Иконки (SVG) ---
const IconLeaf = () => <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M2 12C2 6.477 6.477 2 12 2c4.991 0 9.123 3.65 9.876 8.421.021.134.034.269.034.406 0 6.075-4.925 11-11 11-5.075 0-9.38-3.456-10.577-8.135a1.002 1.002 0 0 1 1.667-.692ZM12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z"/></svg>;
const IconUsers = () => <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconGas = () => <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v-2m6-2v-2M4 9h2m-2 6h2m14-6h-2m2 6h-2M5 7a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2H5z" /></svg>;
const IconPlane = () => <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const IconCloud = () => <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;

export default function App() {
  const [activeTab, setActiveTab] = useState('filters'); 
  const [distance, setDistance] = useState('1500');
  const [fuel, setFuel] = useState('low');
  
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionsData, setRegionsData] = useState({});
  const [scenarioData, setScenarioData] = useState({});

  useEffect(() => {
    fetchRegions().then(setRegionsData).catch(console.error);
  }, []);

  useEffect(() => {
    const group = activeTab === 'rating' ? 'rating' : 'fuel';
    const scenario = activeTab === 'rating' ? fuel : `${distance}_${fuel}`;
    fetchScenario(group, scenario).then(setScenarioData).catch(console.error);
  }, [activeTab, distance, fuel]);

  const selectedRank = selectedRegion && scenarioData[selectedRegion] 
    ? getSortedRegions(scenarioData).find(r => r.id === selectedRegion)?.rank 
    : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-dark text-slate-200 font-sans overflow-hidden">
      
      {/* ШАПКА */}
      <header className="bg-panel-dark border-b border-slate-700 px-6 py-4 flex justify-between items-center z-10 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <IconLeaf />
          <span className="text-xl font-bold text-white tracking-wide">ЭкоАтлас SAF</span>
        </div>
        
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button 
            onClick={() => setActiveTab('filters')} 
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'filters' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Фильтры
          </button>
          <button 
            onClick={() => setActiveTab('rating')} 
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'rating' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Итоговый рейтинг
          </button>
        </div>
      </header>

      {/* ФИЛЬТРЫ */}
      <div className="bg-panel-dark px-6 py-4 border-b border-slate-700 flex gap-6 z-10 shadow-md shrink-0">
        {activeTab === 'filters' && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-400">Дистанция:</label>
            <div className="relative">
              <select value={distance} onChange={(e) => setDistance(e.target.value)} className="appearance-none bg-slate-800 border border-slate-600 rounded-lg pl-4 pr-10 py-2 text-sm text-white outline-none focus:border-green-500 cursor-pointer transition-colors">
                <option value="1500">1500 км</option>
                <option value="3000">3000 км</option>
                <option value="4500">4500 км</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">▼</div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-400">Расход топлива:</label>
          <div className="relative">
            <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="appearance-none bg-slate-800 border border-slate-600 rounded-lg pl-4 pr-10 py-2 text-sm text-white outline-none focus:border-green-500 cursor-pointer transition-colors">
              <option value="low">Малый</option>
              <option value="medium">Средний</option>
              <option value="high">Максимальный</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">▼</div>
          </div>
        </div>
      </div>

      {/* ОСНОВНАЯ ЧАСТЬ */}
      <div className="flex flex-1 relative overflow-hidden min-h-0">
        
        {/* Карта */}
        <div className="flex-1 relative z-0">
          <Map scenarioData={scenarioData} onRegionClick={setSelectedRegion} />
        </div>

        {/* Правая панель */}
        <div className="w-[420px] bg-panel-dark border-l border-slate-700 p-5 overflow-y-auto z-10 shadow-2xl flex flex-col gap-5 shrink-0">
          
          {/* Плашка выбранного региона (Добавлен shrink-0, убран overflow-hidden) */}
          {selectedRegion && regionsData[selectedRegion] && (
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-5 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)] shrink-0">
              <h2 className="text-lg font-bold mb-5 text-white flex items-start gap-2">
                <IconLeaf />
                <span className="leading-tight">{regionsData[selectedRegion].name}</span>
              </h2>
              
              <div className="flex gap-4">
                {/* Левая часть с данными */}
                <div className="flex-1 space-y-3 text-sm min-w-0">
                  <div className="flex items-start gap-3">
                    <IconUsers />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Население</span>
                      <span className="font-semibold text-white">{regionsData[selectedRegion].population.toLocaleString('ru-RU')} чел.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IconGas />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Объем SAF</span>
                      <span className="font-semibold text-white">{regionsData[selectedRegion].saf} тыс. т</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IconPlane />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Пассажиропоток</span>
                      <span className="font-semibold text-white">{regionsData[selectedRegion].passengers.toLocaleString('ru-RU')} чел.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IconCloud />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Предотвращенные выбросы</span>
                      <span className="font-semibold text-white">{regionsData[selectedRegion].emissions.toLocaleString('ru-RU')} т CO₂</span>
                    </div>
                  </div>
                </div>

                {/* Правая часть с рейтингом (Добавлен shrink-0) */}
                {selectedRank && (
                  <div className="flex flex-col items-center justify-center border-l border-slate-700 pl-4 shrink-0">
                    <div 
                      className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-bold text-white mb-2"
                      style={{ borderColor: RANK_COLORS[selectedRank - 1] }}
                    >
                      {selectedRank}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider text-center w-16 leading-tight">Рейтинг<br/>региона</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Таблица рейтинга (Добавлен flex-1 min-h-0, чтобы скроллился только список) */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-bold mb-4 text-slate-200 uppercase tracking-wider shrink-0">
              {activeTab === 'rating' ? 'Итоговый рейтинг' : 'Годовое потребление'}
            </h3>
            
            {Object.keys(scenarioData).length === 0 ? (
              <p className="text-slate-500 text-sm">Загрузка данных...</p>
            ) : (
              <div className="space-y-1 overflow-y-auto pr-1 flex-1">
                {getSortedRegions(scenarioData).map((region) => (
                  <div 
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${selectedRegion === region.id ? 'bg-slate-700 ring-1 ring-slate-500' : 'hover:bg-slate-700/50'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span 
                        className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-slate-900"
                        style={{ backgroundColor: RANK_COLORS[region.rank - 1] || RANK_COLORS[7] }}
                      >
                        {region.rank}
                      </span>
                      <span className="text-sm text-slate-200 truncate">
                        {regionsData[region.id]?.name || region.id}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-300 flex-shrink-0 ml-2">
                      {activeTab === 'rating' 
                        ? region.value.toFixed(4) 
                        : region.value.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}