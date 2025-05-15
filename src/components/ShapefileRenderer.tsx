"use client";

import { Circle, CircleMarker, Polygon, Polyline, Popup, Rectangle } from 'react-leaflet';
import { MapContainer } from 'react-leaflet/MapContainer';
import { TileLayer } from 'react-leaflet/TileLayer';
import { useMap } from 'react-leaflet/hooks';
import 'leaflet/dist/leaflet.css';
import React, { useEffect } from 'react';
import L from 'leaflet';

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
  useEffect(() => {
    // create map
    const map = L.map('map', {
      center: [49.8419, 24.0315],
      zoom: 16,
      layers: [
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }),
      ]
    });

    return () => {
      map.off();
      map.remove();
    };
  }, []);

  return (
    <div id="map" style={{ height: "100vh" }} />
  );
}

export default ShapefileRenderer;
