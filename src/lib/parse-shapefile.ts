import { Shapefile, ShapePolygon, ShapeType } from 'shapefile.js';
import { v4 as uuidv4 } from 'uuid';
import proj4 from 'proj4';
import { center as turfCenter } from "@turf/center";
import { points as turfPoints } from "@turf/helpers";

export type LatLngCoordinate = [number, number];

export type ShapefileMetadata = {
  id: string;
  name: string;
  center: LatLngCoordinate;
  entities: Array<ShapefileEntity>;
};

export type ShapefileEntity = {
  id: string;
  type: 'polygon',
  points: Array<LatLngCoordinate>,
};

function reformatXYasLatLng(input: { x: number, y: number }): LatLngCoordinate {
  return [input.y, input.x];
}

export default async function parseShapefile(input: ArrayBuffer): Promise<{
  center: LatLngCoordinate,
  metadataList: Array<ShapefileMetadata>,
}> {
  const parsedContents = await Shapefile.load(input);

  const metadataList = Object.entries(parsedContents).map(([subFile, shapefile]) => {
    const entities: Array<ShapefileEntity> = [];
    const parsed = shapefile.parse('shp');

    // Extract the projection information, and convert from the UTM coordinates into lat/lng
    // ref: https://stackoverflow.com/questions/31900600/python-and-shapefile-very-large-coordinates-after-importing-shapefile
    // ref: https://github.com/mbostock/shapefile/issues/27
    if (!shapefile.contents.prj) {
      console.warn(`Warning - no prj file found for ${subFile}, skipping...`);
      return null;
    }
    const projection = new TextDecoder().decode(shapefile.contents.prj);
    const converter = proj4(projection, "WGS84");

    const { minX, minY, maxX, maxY } = parsed.header.boundingBox;
    const upperLeft = reformatXYasLatLng(converter.forward({ x: minX, y: minY }));
    const upperRight = reformatXYasLatLng(converter.forward({ x: minX, y: maxY }));
    const lowerLeft = reformatXYasLatLng(converter.forward({ x: maxX, y: minY }));
    const lowerRight = reformatXYasLatLng(converter.forward({ x: maxX, y: maxY }));

    const centerResult = turfCenter(turfPoints([ upperLeft, upperRight, lowerLeft, lowerRight ]));
    const center = centerResult.geometry.coordinates as LatLngCoordinate;

    for (const record of parsed.records) {
      switch (record.body.type) {
        case ShapeType.Polygon: {
          // NOTE: the typescript types here don't seem to handle the discriminated union properly?
          const body = record.body.data as ShapePolygon;
          const points = body.points as unknown as Array<{x: number, y: number}>;
          entities.push({
            id: uuidv4(),
            type: 'polygon',
            points: points.map(point => {
              const converted = converter.forward({ x: point.x, y: point.y });
              return reformatXYasLatLng(converted);
            }),
          });
        }
        // FIXME: parse more kinds of data here!
      }
    }

    return { id: uuidv4(), name: subFile, center, entities };
  }).filter((result): result is ShapefileMetadata => result !== null);

  const centerResult = turfCenter(turfPoints(metadataList.map(item => item.center)))
  const center = centerResult.geometry.coordinates as LatLngCoordinate;

  return { center, metadataList };
}
