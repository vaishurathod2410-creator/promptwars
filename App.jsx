import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroDashboard } from './components/HeroDashboard';
import { InteractiveMap } from './components/InteractiveMap';
import { PlaceCard } from './components/PlaceCard';
import { PlaceFilters } from './components/PlaceFilters';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { ComparisonDrawer } from './components/ComparisonDrawer';
import { AiAssistant } from './components/AiAssistant';
import { CityAlerts } from './components/CityAlerts';
import { CitizenReportModal } from './components/CitizenReportModal';
import { CultureGuide } from './components/CultureGuide';
import { Footer } from './components/Footer';

import { PLACES } from './data/places';
import { INITIAL_ALERTS } from './data/alerts';
import { useLanguage } from './context/LanguageContext';
import { MapPin, Layers, Sparkles, AlertTriangle, Compass, BookOpen } from 'lucide-react';

export function App() {
  const { t } = useLanguage();

  const [selectedCity, setSelectedCity] = useState('mumbai');
  const [activeTab, setActiveTab] = useState('explore'); // explore, map, alerts, compare, assistant, culture
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceLevel, setPriceLevel] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [verifiedSafetyOnly, setVerifiedSafetyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [selectedPlaceForModal, setSelectedPlaceForModal] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);

  // Live Alerts State
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  // Fetch initial alerts from backend if server running
  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAlerts(data);
      })
      .catch(err => console.log('Using initial client alerts state:', err.message));
  }, []);

  // Filter Places Logic
  const filteredPlaces = PLACES.filter((place) => {
    if (place.cityId !== selectedCity) return false;
    if (selectedCategory !== 'all' && place.category !== selectedCategory) return false;
    if (priceLevel !== 'all' && place.priceLevel !== priceLevel) return false;
    if (minRating > 0 && place.rating < minRating) return false;
    if (wheelchairOnly && !place.accessibility.wheelchair) return false;
    if (verifiedSafetyOnly && place.safetyInfo.safetyRating < 4.0) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = place.name.toLowerCase().includes(q);
      const matchDesc = place.description.toLowerCase().includes(q);
      const matchAddress = place.address.toLowerCase().includes(q);
      const matchHighlights = place.highlights.some(h => h.toLowerCase().includes(q));
      return matchName || matchDesc || matchAddress || matchHighlights;
    }

    return true;
  });

  // Toggle Place in Comparison List
  const handleToggleCompare = (place) => {
    setCompareList(prev => {
      const exists = prev.some(p => p.id === place.id);
      if (exists) {
        return prev.filter(p => p.id !== place.id);
      } else {
        return [...prev, place];
      }
    });
  };

  // Submit Citizen Report
  const handleSubmitReport = async (reportData) => {
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      const data = await res.json();
      if (data.report) {
        setAlerts(prev => [data.report, ...prev]);
      }
    } catch (err) {
      console.log('Server offline, adding report to local state:', err);
      const newReport = {
        id: `report-${Date.now()}`,
        cityId: reportData.cityId || selectedCity,
        type: reportData.category === 'Safety' ? 'safety' : (reportData.category === 'Traffic' ? 'traffic' : 'weather'),
        title: `[Citizen Report] ${reportData.title}`,
        location: reportData.location,
        description: `${reportData.description} (Urgency: ${reportData.urgency})`,
        severity: reportData.urgency === 'High' ? 'high' : 'medium',
        timestamp: 'Just now',
        sourceType: 'community',
        photo: reportData.photo || null,
        upvotes: 1
      };
      setAlerts(prev => [newReport, ...prev]);
    }
  };

  // Upvote Alert
  const handleUpvoteAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, upvotes: (a.upvotes || 0) + 1 } : a));
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSelectedCategory('all');
    setPriceLevel('all');
    setMinRating(0);
    setWheelchairOnly(false);
    setVerifiedSafetyOnly(false);
    setSearchQuery('');
  };

  const activeCityAlertsCount = alerts.filter(a => a.cityId === selectedCity).length;

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-brand-blue selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={(cityId) => {
          setSelectedCity(cityId);
          handleClearFilters();
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        compareCount={compareList.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">

        {/* Hero Banner (Shown on Explore tab) */}
        {activeTab === 'explore' && (
          <HeroDashboard
            selectedCity={selectedCity}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            totalPlacesCount={filteredPlaces.length}
            activeAlertsCount={activeCityAlertsCount}
            onOpenAssistant={() => setActiveTab('assistant')}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          {/* Navigation Pill Bar for Mobile / Quick Switch */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800">
            {[
              { id: 'explore', label: t('nav_explore'), icon: Compass },
              { id: 'map', label: t('nav_map'), icon: MapPin },
              { id: 'alerts', label: t('nav_alerts'), icon: AlertTriangle, badge: activeCityAlertsCount },
              { id: 'compare', label: t('nav_compare'), icon: Layers, badge: compareList.length },
              { id: 'assistant', label: t('nav_assistant'), icon: Sparkles },
              { id: 'culture', label: t('nav_culture'), icon: BookOpen },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-glow-blue'
                      : 'bg-navy-850 text-slate-300 border border-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {Boolean(tab.badge) && tab.badge > 0 && (
                    <span className="bg-brand-purple text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: EXPLORE PLACES */}
          {activeTab === 'explore' && (
            <section className="space-y-8">
              
              {/* Interactive Map Snapshot */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-brand-blue" />
                    <span>Interactive City Map</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs text-brand-blue hover:underline font-semibold"
                  >
                    Expand Full Map →
                  </button>
                </div>
                
                <InteractiveMap
                  selectedCity={selectedCity}
                  places={filteredPlaces}
                  onSelectPlace={(place) => setSelectedPlaceForModal(place)}
                  onToggleCompare={handleToggleCompare}
                  compareList={compareList}
                />
              </div>

              {/* Filters Bar */}
              <PlaceFilters
                category={selectedCategory}
                setCategory={setSelectedCategory}
                priceLevel={priceLevel}
                setPriceLevel={setPriceLevel}
                minRating={minRating}
                setMinRating={setMinRating}
                wheelchairOnly={wheelchairOnly}
                setWheelchairOnly={setWheelchairOnly}
                verifiedSafetyOnly={verifiedSafetyOnly}
                setVerifiedSafetyOnly={setVerifiedSafetyOnly}
                onClearFilters={handleClearFilters}
                totalResults={filteredPlaces.length}
              />

              {/* Places Cards Grid */}
              {filteredPlaces.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 text-slate-400 space-y-3">
                  <Compass className="w-12 h-12 mx-auto text-slate-500" />
                  <h3 className="text-base font-bold text-white">No places match your active filters</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try adjusting your category, price, rating, or wheelchair accessibility filters.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onSelectPlace={(p) => setSelectedPlaceForModal(p)}
                      onToggleCompare={handleToggleCompare}
                      isComparing={compareList.some(p => p.id === place.id)}
                    />
                  ))}
                </div>
              )}

            </section>
          )}

          {/* TAB 2: INTERACTIVE FULL MAP */}
          {activeTab === 'map' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Interactive Leaflet Explorer</h2>
                  <p className="text-xs text-slate-400">Click markers to view ratings, accessibility notes, and safety scores.</p>
                </div>
                <span className="text-xs text-slate-400 font-semibold bg-navy-850 px-3 py-1.5 rounded-lg border border-slate-700">
                  Showing {filteredPlaces.length} Markers
                </span>
              </div>

              <InteractiveMap
                selectedCity={selectedCity}
                places={filteredPlaces}
                onSelectPlace={(place) => setSelectedPlaceForModal(place)}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
              />
            </section>
          )}

          {/* TAB 3: CITY ALERTS */}
          {activeTab === 'alerts' && (
            <CityAlerts
              alerts={alerts}
              selectedCity={selectedCity}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onUpvoteAlert={handleUpvoteAlert}
            />
          )}

          {/* TAB 4: COMPARE PLACES */}
          {activeTab === 'compare' && (
            <section className="space-y-6">
              <ComparisonDrawer
                compareList={compareList}
                onRemoveFromCompare={(id) => setCompareList(prev => prev.filter(p => p.id !== id))}
                onClearAll={() => setCompareList([])}
                isOpen={true}
                onClose={() => setActiveTab('explore')}
              />
            </section>
          )}

          {/* TAB 5: AI CITY ASSISTANT */}
          {activeTab === 'assistant' && (
            <AiAssistant selectedCity={selectedCity} />
          )}

          {/* TAB 6: CULTURE GUIDE */}
          {activeTab === 'culture' && (
            <CultureGuide selectedCity={selectedCity} />
          )}

        </div>

      </main>

      {/* Floating Sticky Comparison Bar (when places selected in compare list) */}
      {compareList.length > 0 && activeTab !== 'compare' && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 duration-300">
          <button
            onClick={() => setActiveTab('compare')}
            className="glass-panel px-5 py-3 rounded-2xl border border-brand-purple/50 bg-navy-900/90 shadow-2xl flex items-center space-x-3 text-white hover:scale-105 transition-transform"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center font-bold text-xs">
              {compareList.length}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold">Comparing Places</div>
              <div className="text-[10px] text-slate-400">Click to open comparison matrix</div>
            </div>
          </button>
        </div>
      )}

      {/* Place Detail Modal */}
      {selectedPlaceForModal && (
        <PlaceDetailModal
          place={selectedPlaceForModal}
          onClose={() => setSelectedPlaceForModal(null)}
          onToggleCompare={handleToggleCompare}
          isComparing={compareList.some(p => p.id === selectedPlaceForModal.id)}
        />
      )}

      {/* Citizen Report Modal */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedCity={selectedCity}
        onSubmitReport={handleSubmitReport}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
