"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const center: [number, number] = [51.505, -0.09];

const polyline: Array<[number, number]> = [
  [51.505, -0.09],
  [51.51, -0.1],
  [51.51, -0.12],
];

const multiPolyline: Array<Array<[number, number]>> = [
  [
    [51.5, -0.1],
    [51.5, -0.12],
    [51.52, -0.12],
  ],
  [
    [51.5, -0.05],
    [51.5, -0.06],
    [51.52, -0.06],
  ],
];

const polygon: Array<[number, number]> = [
  [51.515, -0.09],
  [51.52, -0.1],
  [51.52, -0.12],
];

const multiPolygon: Array<Array<[number, number]>> = [
  [
    [51.51, -0.12],
    [51.51, -0.13],
    [51.53, -0.13],
  ],
  [
    [51.51, -0.05],
    [51.51, -0.07],
    [51.53, -0.07],
  ],
];

const rectangle: Array<[number, number]> = [
  [51.49, -0.08],
  [51.5, -0.06],
];

const fillBlueOptions = { fillColor: 'blue' }
const blackOptions = { color: 'black' }
const limeOptions = { color: 'lime' }
const purpleOptions = { color: 'purple' }
const redOptions = { color: 'red' }

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
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }),
        L.polygon(polygon, { color: '#ff0000' }),
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
