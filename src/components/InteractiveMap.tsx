import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SavedDevice, GeofenceZone, Coordinates, LocationPoint } from '../types';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Compass,
  MapPin,
  Shield,
  Battery,
  Wifi,
  Navigation,
  Eye,
  Activity,
} from 'lucide-react';

interface InteractiveMapProps {
  devices: SavedDevice[];
  selectedDeviceId: string | null;
  onSelectDevice: (id: string) => void;
  geofences: GeofenceZone[];
  searchTarget: { coordinates: Coordinates; label: string; phone: string } | null;
  showBreadcrumbs: boolean;
  showGeofences: boolean;
  mapTileStyle: 'light' | 'dark' | 'satellite' | 'streets';
  onChangeTileStyle: (style: 'light' | 'dark' | 'satellite' | 'streets') => void;
  onMapClick?: (coords: Coordinates) => void;
}

const TILE_URLS = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const TILE_ATTRIBUTIONS = {
  light: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  dark: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  streets: '&copy; OpenStreetMap contributors',
  satellite: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  devices,
  selectedDeviceId,
  onSelectDevice,
  geofences,
  searchTarget,
  showBreadcrumbs,
  showGeofences,
  mapTileStyle,
  onChangeTileStyle,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const geofenceCirclesRef = useRef<L.Circle[]>([]);
  const breadcrumbPolylinesRef = useRef<L.Polyline[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  const [mapZoom, setMapZoom] = useState<number>(13);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 37.7749, lng: -122.4194 });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = searchTarget
        ? [searchTarget.coordinates.lat, searchTarget.coordinates.lng]
        : [37.7749, -122.4194];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false, // Custom styled zoom controls
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(TILE_URLS[mapTileStyle], {
        maxZoom: 19,
        attribution: TILE_ATTRIBUTIONS[mapTileStyle],
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      map.on('zoomend', () => {
        setMapZoom(map.getZoom());
      });

      map.on('moveend', () => {
        const center = map.getCenter();
        setMapCenter({ lat: center.lat, lng: center.lng });
      });

      map.on('click', (e) => {
        if (onMapClick) {
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when tile style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(TILE_URLS[mapTileStyle], {
      maxZoom: 19,
      attribution: TILE_ATTRIBUTIONS[mapTileStyle],
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [mapTileStyle]);

  // Update Geofence Circles
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear old circles
    geofenceCirclesRef.current.forEach((circle) => circle.remove());
    geofenceCirclesRef.current = [];

    if (showGeofences) {
      geofences.forEach((zone) => {
        if (!zone.active) return;
        const circle = L.circle([zone.center.lat, zone.center.lng], {
          radius: zone.radiusMeters,
          color: zone.color || '#3B82F6',
          fillColor: zone.color || '#3B82F6',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '6, 6',
        }).addTo(mapInstanceRef.current!);

        circle.bindTooltip(
          `<div class="font-sans text-xs font-semibold px-2 py-1">${zone.name} (${zone.radiusMeters}m radius)</div>`,
          { permanent: false, direction: 'top' }
        );

        geofenceCirclesRef.current.push(circle);
      });
    }
  }, [geofences, showGeofences]);

  // Update Device Markers & Breadcrumbs
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear old breadcrumbs
    breadcrumbPolylinesRef.current.forEach((line) => line.remove());
    breadcrumbPolylinesRef.current = [];

    // Update/create markers
    devices.forEach((device) => {
      const isSelected = device.id === selectedDeviceId;
      const { lat, lng } = device.currentLoc;

      // Create Custom Animated DivIcon for Device
      const divIconHtml = `
        <div class="relative flex items-center justify-center">
          ${
            isSelected
              ? `<div class="absolute -inset-3 rounded-full bg-blue-500/20 animate-ping"></div>
                 <div class="absolute -inset-2 rounded-full border-2 border-blue-500 animate-pulse"></div>`
              : ''
          }
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr ${
            device.avatarColor
          } text-white shadow-xl ring-2 ring-white border border-slate-900 cursor-pointer transform hover:scale-110 transition-transform">
            <span class="text-xs font-black tracking-tighter">${device.flag}</span>
            ${
              device.status === 'moving'
                ? `<div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>`
                : ''
            }
          </div>
          <div class="absolute top-11 whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[11px] font-semibold border border-slate-700 shadow-md">
            ${device.name} ${device.currentLoc.speed > 0 ? `• ${device.currentLoc.speed} km/h` : ''}
          </div>
        </div>
      `;

      const customDivIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: divIconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (markersRef.current[device.id]) {
        // Update position and icon
        markersRef.current[device.id].setLatLng([lat, lng]);
        markersRef.current[device.id].setIcon(customDivIcon);
      } else {
        // Create marker
        const marker = L.marker([lat, lng], { icon: customDivIcon }).addTo(mapInstanceRef.current!);

        marker.on('click', () => {
          onSelectDevice(device.id);
        });

        markersRef.current[device.id] = marker;
      }

      // Draw Breadcrumb Polyline Trail
      if (showBreadcrumbs && device.history.length > 1) {
        const polylineCoords: [number, number][] = device.history.map((pt) => [pt.lat, pt.lng]);
        polylineCoords.push([lat, lng]);

        const polyline = L.polyline(polylineCoords, {
          color: isSelected ? '#3B82F6' : '#64748B',
          weight: isSelected ? 4 : 2,
          opacity: isSelected ? 0.9 : 0.5,
          dashArray: isSelected ? undefined : '5, 10',
        }).addTo(mapInstanceRef.current!);

        breadcrumbPolylinesRef.current.push(polyline);
      }
    });

    // Remove markers for deleted devices
    Object.keys(markersRef.current).forEach((id) => {
      if (!devices.find((d) => d.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [devices, selectedDeviceId, showBreadcrumbs]);

  // Handle Search Target Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (searchTarget) {
      const { lat, lng } = searchTarget.coordinates;

      const searchDivHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-4 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="relative flex items-center justify-center w-11 h-11 rounded-full bg-emerald-600 text-white shadow-2xl ring-4 ring-emerald-300/40 border-2 border-white">
            <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div class="absolute top-12 whitespace-nowrap px-3 py-1 rounded-xl bg-slate-900 text-emerald-400 text-xs font-bold border border-emerald-500/40 shadow-xl">
            🎯 ${searchTarget.phone} (${searchTarget.label})
          </div>
        </div>
      `;

      const searchIcon = L.divIcon({
        className: 'custom-search-marker',
        html: searchDivHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      if (searchMarkerRef.current) {
        searchMarkerRef.current.setLatLng([lat, lng]);
        searchMarkerRef.current.setIcon(searchIcon);
      } else {
        searchMarkerRef.current = L.marker([lat, lng], { icon: searchIcon }).addTo(mapInstanceRef.current);
      }

      // Smooth pan to search target
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
    } else if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
  }, [searchTarget]);

  // Center on Selected Device when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedDeviceId) return;
    const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
    if (selectedDevice) {
      mapInstanceRef.current.flyTo(
        [selectedDevice.currentLoc.lat, selectedDevice.currentLoc.lng],
        15,
        { duration: 1.2 }
      );
    }
  }, [selectedDeviceId]);

  // Helper Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const allCoords: [number, number][] = [];
    devices.forEach((d) => allCoords.push([d.currentLoc.lat, d.currentLoc.lng]));
    if (searchTarget) allCoords.push([searchTarget.coordinates.lat, searchTarget.coordinates.lng]);

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-900 rounded-2xl shadow-2xl border border-slate-800">
      {/* The Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls Top-Right */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Layer Switcher */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-blue-400" /> Map Mode
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => onChangeTileStyle('dark')}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                mapTileStyle === 'dark'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🌙 Dark
            </button>
            <button
              onClick={() => onChangeTileStyle('light')}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                mapTileStyle === 'light'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => onChangeTileStyle('satellite')}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                mapTileStyle === 'satellite'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => onChangeTileStyle('streets')}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                mapTileStyle === 'streets'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🗺️ Terrain
            </button>
          </div>
        </div>

        {/* Zoom & Recenter Controls */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl p-1 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-800 my-0.5" />
          <button
            onClick={handleFitAll}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
            title="Recenter & Fit All Targets"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Map Status Overlay Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-[1000] hidden sm:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl shadow-2xl text-xs text-slate-300">
        <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Telemetry
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div>
          Lat: <span className="text-white font-mono">{mapCenter.lat.toFixed(4)}</span>
        </div>
        <div>
          Lng: <span className="text-white font-mono">{mapCenter.lng.toFixed(4)}</span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div>
          Zoom: <span className="text-white font-mono">{mapZoom}</span>
        </div>
      </div>
    </div>
  );
};
