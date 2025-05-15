"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import grayscaleTileLayer from '@/lib/grayscale-tilelayer';
import useShapefileDataContext from '@/contexts/shapefile-data';

const polygon: Array<[number, number]> = [
  [51.515, -0.09],
  [51.52, -0.1],
  [51.52, -0.12],
];

function ShapefileRenderer() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const { data } = useShapefileDataContext();

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const layers = data.status === 'ready' ? data.data.flatMap(metadata => {
      return metadata.entities.map(entity => {
        switch (entity.type) {
          case 'polygon': {
            return L.polygon(entity.points, { color: 'red' });
          }
          // FIXME: add more types of entities!
        }
      });
    }) : [];

    console.log('LAYERS', layers);

    // Initially create map
    const map = L.map(mapRef.current, {
      center: [51.505, -0.09],
      zoom: 16,
      layers: [
        grayscaleTileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }),
        ...layers,
      ]
    });

    return () => {
      map.off();
      map.remove();
    };
  }, [data]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}

export default ShapefileRenderer;
