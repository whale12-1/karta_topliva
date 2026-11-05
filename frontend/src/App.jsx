import { useEffect, useMemo, useState } from 'react';
import Map from './components/Map';
import { fetchRegions, fetchScenario } from './api';
import { getSortedRegions } from './utils/calculate';
import { RANK_COLORS } from './data/constants';

const IconLeaf = () => (
  <svg className="h-6 w-6 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 3.5C12 3.5 5 6.2 4.1 12.1c-.5 3.5 2.1 6.2 5.4 6.2 5.2 0 9.4-6.3 11-14.8ZM3.5 21c2.1-5 5.6-8.3 10.4-10.9" />
  </svg>
);
const IconUsers = () => <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 19h5v-1a4 4 0 0 0-5.2-3.8M16 19H8m8 0v-1a4 4 0 0 0-8 0v1m8-12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm5 3a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM3 10a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" /></svg>;
const IconGas = () => <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M2 21h15M7 7h5v5H7zM15 8h2l3 3v6a2 2 0 0 1-4 0v-3" /></svg>;
const IconPlane = () => <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m3 14 18-5-7 7-2 5-3-7-6 0Zm9 0 2-5" /></svg>;
const IconCloud = () => <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18h11a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 4.8 4.8 0 0 0 6 18Z" /></svg>;
const IconFuel = () => <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M2 21h15M7 7h5v5H7zM15 8h2l3 3v6a2 2 0 0 1-4 0v-3" /></svg>;
const IconCoverage = () => <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18a9 9 0 1 0 9 9h-9V3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z" /></svg>;

const DISTANCES = [
  { value: '1500', label: '1500 км' },
  { value: '3000', label: '3000 км' },
  { value: '4500', label: '4500 км' },
];
const FUEL_LEVELS = [
  { value: 'low', label: 'Малый' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Максимальный' },
];

function SelectField({ label, value, onChange, options, activate }) {
  return (
    <label className="scenario-field" onFocus={activate}>
      <span>{label}</span>
      <span className="scenario-select-wrap">
        <select value={value} onChange={(event) => { onChange(event.target.value); activate(); }}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <span className="select-chevron">⌄</span>
      </span>
    </label>
  );
}

function ScenarioFilterCard({ kind, title, distance, setDistance, fuel, setFuel, active, onActivate }) {
  const isFuel = kind === 'fuel';
  return (
    <section className={`scenario-card ${active ? 'scenario-card-active' : ''}`}>
      <button type="button" className="scenario-card-title" onClick={onActivate} aria-pressed={active}>
        <span className={`scenario-icon ${isFuel ? 'scenario-icon-fuel' : 'scenario-icon-coverage'}`}>
          {isFuel ? <IconFuel /> : <IconCoverage />}
        </span>
        <span>{title}</span>
        <span className="scenario-active-hint">{active ? 'На карте' : 'Показать на карте'}</span>
      </button>
      <div className="scenario-fields">
        <SelectField label="Дистанция" value={distance} onChange={setDistance} options={DISTANCES} activate={onActivate} />
        <SelectField label="Расход топлива" value={fuel} onChange={setFuel} options={FUEL_LEVELS} activate={onActivate} />
      </div>
    </section>
  );
}

const fmtInt = (value) => Number(value || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 });
const fmtDecimal = (value, digits = 2) => Number(value || 0).toLocaleString('ru-RU', { maximumFractionDigits: digits });

export default function App() {
  const [activeTab, setActiveTab] = useState('filters');
  const [activeMetric, setActiveMetric] = useState('fuel');

  // Two independent pairs of scenario filters, as specified in the project brief.
  const [fuelDistance, setFuelDistance] = useState('4500');
  const [fuelLevel, setFuelLevel] = useState('high');
  const [coverageDistance, setCoverageDistance] = useState('4500');
  const [coverageFuelLevel, setCoverageFuelLevel] = useState('high');

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionsData, setRegionsData] = useState({});
  const [fuelData, setFuelData] = useState({});
  const [coverageData, setCoverageData] = useState({});
  const [ratingData, setRatingData] = useState({});
  const [fuelLoading, setFuelLoading] = useState(true);
  const [coverageLoading, setCoverageLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchRegions()
      .then(setRegionsData)
      .catch((error) => { console.error(error); setLoadError('Не удалось загрузить справочник регионов'); });
  }, []);

  useEffect(() => {
    setFuelLoading(true);
    fetchScenario('fuel', `${fuelDistance}_${fuelLevel}`)
      .then(setFuelData)
      .catch((error) => { console.error(error); setLoadError('Не удалось загрузить данные годового потребления топлива'); })
      .finally(() => setFuelLoading(false));
  }, [fuelDistance, fuelLevel]);

  useEffect(() => {
    setCoverageLoading(true);
    fetchScenario('coverage', `${coverageDistance}_${coverageFuelLevel}`)
      .then(setCoverageData)
      .catch((error) => { console.error(error); setLoadError('Не удалось загрузить данные покрытия спроса'); })
      .finally(() => setCoverageLoading(false));
  }, [coverageDistance, coverageFuelLevel]);

  useEffect(() => {
    setRatingLoading(true);
    fetchScenario('rating', fuelLevel)
      .then(setRatingData)
      .catch((error) => { console.error(error); setLoadError('Не удалось загрузить итоговый рейтинг'); })
      .finally(() => setRatingLoading(false));
  }, [fuelLevel]);

  const scenarioData = useMemo(() => {
    if (activeTab === 'rating') return ratingData;
    return activeMetric === 'coverage' ? coverageData : fuelData;
  }, [activeTab, activeMetric, ratingData, coverageData, fuelData]);

  const sortedRegions = useMemo(() => getSortedRegions(scenarioData), [scenarioData]);
  const viewLoading = activeTab === 'rating' ? ratingLoading : activeMetric === 'coverage' ? coverageLoading : fuelLoading;
  const selectedRank = selectedRegion
    ? sortedRegions.find((region) => region.id === selectedRegion)?.rank
    : null;
  const selectedRegionData = selectedRegion ? regionsData[selectedRegion] : null;

  const tableTitle = activeTab === 'rating'
    ? 'Итоговый рейтинг регионов'
    : activeMetric === 'coverage'
      ? 'Доля покрытия спроса на топливо'
      : 'Годовое потребление топлива';

  const selectedScenarioText = activeTab === 'rating'
    ? `Вариант расхода топлива: ${FUEL_LEVELS.find((item) => item.value === fuelLevel)?.label.toLowerCase()}`
    : activeMetric === 'coverage'
      ? `Сценарий: ${coverageDistance} км • ${FUEL_LEVELS.find((item) => item.value === coverageFuelLevel)?.label.toLowerCase()} расход`
      : `Сценарий: ${fuelDistance} км • ${FUEL_LEVELS.find((item) => item.value === fuelLevel)?.label.toLowerCase()} расход`;

  const formatValue = (value) => {
    if (activeTab === 'rating') return Number(value).toFixed(4);
    if (activeMetric === 'coverage') return `${fmtDecimal(value, 2)}%`;
    return fmtInt(value);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark"><IconLeaf /></span>
          <span className="brand-name">ЭкоАтлас <b>SAF</b></span>
        </div>

        <nav className="top-tabs" aria-label="Разделы сайта">
          <button type="button" onClick={() => setActiveTab('filters')} className={activeTab === 'filters' ? 'top-tab active' : 'top-tab'}>
            <span className="tab-filter-glyph">≡</span>Фильтры
          </button>
          <button type="button" onClick={() => setActiveTab('rating')} className={activeTab === 'rating' ? 'top-tab active' : 'top-tab'}>
            <span className="tab-rating-glyph">▥</span>Итоговый рейтинг
          </button>
        </nav>
        <div className="header-note">ИНТЕРАКТИВНАЯ МОДЕЛЬ РЕГИОНАЛЬНОГО ПОТЕНЦИАЛА</div>
      </header>

      <div className="filters-bar">
        {activeTab === 'filters' ? (
          <div className="filter-groups-grid">
            <ScenarioFilterCard
              kind="fuel"
              title="Годовой объём потребления топлива"
              distance={fuelDistance}
              setDistance={setFuelDistance}
              fuel={fuelLevel}
              setFuel={setFuelLevel}
              active={activeMetric === 'fuel'}
              onActivate={() => setActiveMetric('fuel')}
            />
            <ScenarioFilterCard
              kind="coverage"
              title="Доля покрытия спроса на топливо"
              distance={coverageDistance}
              setDistance={setCoverageDistance}
              fuel={coverageFuelLevel}
              setFuel={setCoverageFuelLevel}
              active={activeMetric === 'coverage'}
              onActivate={() => setActiveMetric('coverage')}
            />
          </div>
        ) : (
          <div className="rating-filter-row">
            <span className="rating-filter-label">СЦЕНАРИЙ ИНТЕГРАЛЬНОГО РЕЙТИНГА</span>
            <SelectField label="Расход топлива" value={fuelLevel} onChange={setFuelLevel} options={FUEL_LEVELS} activate={() => {}} />
            <span className="rating-filter-note">Значения рейтинга пересчитываются для выбранного варианта расхода</span>
          </div>
        )}
      </div>

      <main className="workspace">
        <section className="map-stage" aria-label="Интерактивная карта России">
          <Map scenarioData={scenarioData} onRegionClick={setSelectedRegion} />
          <div className="map-caption">
            <span className="map-caption-dot" />
            {activeTab === 'rating' ? 'ИНТЕГРАЛЬНАЯ ОЦЕНКА' : activeMetric === 'coverage' ? 'ПОКРЫТИЕ СПРОСА' : 'ПОТРЕБЛЕНИЕ ТОПЛИВА'}
          </div>
        </section>

        <aside className="right-sidebar">
          {selectedRegionData ? (
            <section className="region-summary">
              <div className="region-summary-heading">
                <span className="summary-leaf"><IconLeaf /></span>
                <h2>{selectedRegionData.name}</h2>
              </div>
              <div className="region-summary-body">
                <div className="region-metrics">
                  <div className="metric-line"><IconUsers /><div><span>Население</span><strong>{fmtInt(selectedRegionData.population)} чел.</strong></div></div>
                  <div className="metric-line"><IconGas /><div><span>Объём SAF</span><strong>{fmtDecimal(selectedRegionData.saf, 2)} тыс. т</strong></div></div>
                  <div className="metric-line"><IconPlane /><div><span>Годовой пассажиропоток</span><strong>{fmtInt(selectedRegionData.passengers)} чел.</strong></div></div>
                  <div className="metric-line"><IconCloud /><div><span>Предотвращённые выбросы</span><strong>{fmtDecimal(selectedRegionData.emissions, 2)} т CO₂</strong></div></div>
                </div>
                {selectedRank && (
                  <div className="region-rank-box">
                    <div className="region-rank-number" style={{ '--rank-color': RANK_COLORS[selectedRank - 1] }}>{selectedRank}</div>
                    <span>РЕЙТИНГ<br />РЕГИОНА</span>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="region-placeholder">
              <span className="placeholder-icon"><IconLeaf /></span>
              <div><strong>Выберите регион</strong><span>Нажмите на один из выделенных регионов на карте, чтобы открыть его показатели</span></div>
            </section>
          )}

          <section className="ranking-panel">
            <div className="ranking-heading">
              <div>
                <h3>{tableTitle}</h3>
                <p>{selectedScenarioText}</p>
              </div>
              <span className="ranking-sort">↓</span>
            </div>

            {loadError ? (
              <p className="status-message error-message">{loadError}</p>
            ) : viewLoading ? (
              <p className="status-message">Загрузка данных…</p>
            ) : sortedRegions.length === 0 ? (
              <p className="status-message">Данные пока недоступны</p>
            ) : (
              <>
              <div className="ranking-columns"><span>Регион</span><span>{activeTab === 'rating' ? 'Баллы' : activeMetric === 'coverage' ? 'Покрытие, %' : 'Значение'}</span></div>
              <div className="ranking-list">
                {sortedRegions.map((region) => (
                  <button
                    type="button"
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`ranking-row ${selectedRegion === region.id ? 'selected' : ''}`}
                  >
                    <span className="rank-index" style={{ '--rank-color': RANK_COLORS[region.rank - 1] }}>{region.rank}</span>
                    <span className="rank-region-name">{regionsData[region.id]?.name || region.id}</span>
                    <strong className="rank-value">{formatValue(region.value)}</strong>
                  </button>
                ))}
              </div>
              </>
            )}
            <div className="ranking-footnote"><span /> Максимальное значение — зелёный · минимальное — красный</div>
          </section>
        </aside>
      </main>
    </div>
  );
}
