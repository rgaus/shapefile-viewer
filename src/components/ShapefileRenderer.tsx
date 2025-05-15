"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import grayscaleTileLayer from '@/lib/grayscale-tilelayer';

const polygon: Array<[number, number]> = [
  [51.515, -0.09],
  [51.52, -0.1],
  [51.52, -0.12],
];

function ShapefileRenderer() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    // Initially create map
    const map = L.map(mapRef.current, {
      center: [51.505, -0.09],
      zoom: 16,
      layers: [
        grayscaleTileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }),
        L.polygon(polygon, { color: 'red' }),
      ]
    });

    return () => {
      map.off();
      map.remove();
    };
  }, []);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}

export default ShapefileRenderer;
