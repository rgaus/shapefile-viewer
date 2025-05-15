import { Shapefile, ShapePolygon, ShapeType } from 'shapefile.js';
import { v4 as uuidv4 } from 'uuid';

export type ShapefileMetadata = {
  id: string;
  name: string;
  entities: Array<ShapefileEntity>;
};

export type ShapefileEntity = {
  id: string;
  type: 'polygon',
  points: Array<[number, number]>,
};

export default async function parseShapefile(input: ArrayBuffer): Promise<Array<ShapefileMetadata>> {
  const parsedContents = await Shapefile.load(input);

  return Object.entries(parsedContents).map(([subFile, shapefile]) => {
    const entities: Array<ShapefileEntity> = [];

    const parsed = shapefile.parse('shp');
    for (const record of parsed.records) {
      switch (record.body.type) {
        case ShapeType.Polygon: {
          // NOTE: the typescript types here don't seem to handle the discriminated union properly?
          const body = record.body.data as ShapePolygon;
          const points = body.points as unknown as Array<{x: number, y: number}>;
          entities.push({
            id: uuidv4(),
            type: 'polygon',
            points: points.map(point => [point.x, point.y]),
          });
        }
        // FIXME: parse more kinds of data here!
      }
    }

    return { id: uuidv4(), name: subFile, entities };
  });
}
