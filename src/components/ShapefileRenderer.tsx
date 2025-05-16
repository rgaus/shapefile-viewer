"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import grayscaleTileLayer from '@/lib/grayscale-tilelayer';
import useShapefileDataContext from '@/contexts/shapefile-data';
import { LatLngCoordinate } from '@/lib/parse-shapefile';

const LONDON_LAT_LNG: LatLngCoordinate = [51.505, -0.09];

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
            // FIXME: is this data supposed to be a polygon or multipolygon?
            return L.polygon(entity.points, { color: 'royalblue', weight: 2 });
          }
          // FIXME: add more types of entities!
        }
      });
    }) : [];

    // Initially create map
    const map = L.map(mapRef.current, {
      center: data.status === 'ready' ? data.initialCenter : LONDON_LAT_LNG,
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
