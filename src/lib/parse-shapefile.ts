import { Shapefile, ShapePolygon, ShapeType } from 'shapefile.js';
import { v4 as uuidv4 } from 'uuid';

export type ShapefileMetadata = {
  id: string;
  name: string;
  entities: Array<ShapefileMetadataEntity>;
};

export type ShapefileMetadataEntity = {
  id: string;
  type: 'polygon',
  points: Array<[number, number]>,
};

export default async function parseShapefile(input: ArrayBuffer): Promise<Array<ShapefileMetadata>> {
  const parsedContents = await Shapefile.load(input);

  return Object.entries(parsedContents).map(([subFile, shapefile]) => {
    const entities: Array<ShapefileMetadataEntity> = [];

    const parsed = shapefile.parse('shp');
    for (const record of parsed.records) {
      switch (record.body.type) {
        case ShapeType.Polygon: {
          // NOTE: the typescript types here don't seem to handle the discriminated union properly?
          const body = record.body.data as ShapePolygon;
          entities.push({
            id: uuidv4(),
            type: 'polygon',
            // NOTE: the types are messed up here too?
            points: body.points as unknown as Array<[number, number]>,
          });
        }
        // FIXME: parse more kinds of data here!
      }
    }

    return { id: uuidv4(), name: subFile, entities };
  });
}
