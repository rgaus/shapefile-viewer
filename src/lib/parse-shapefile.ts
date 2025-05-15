import { Shapefile, ShapePolygon, ShapeType } from 'shapefile.js';

type ShapefileEntity = {
  type: 'polygon',
  points: Array<[number, number]>,
};

export default async function parseShapefile(input: ArrayBuffer): Promise<Map<string, Array<ShapefileEntity>>> {
  const parsedContents = await Shapefile.load(input);

  const results = new Map<string, Array<ShapefileEntity>>();

  for (const [subFile, shapefile] of Object.entries(parsedContents)) {
    const entities: Array<ShapefileEntity> = [];

    const parsed = shapefile.parse('shp');
    for (const record of parsed.records) {
      switch (record.body.type) {
        case ShapeType.Polygon: {
          // NOTE: the typescript types here don't seem to handle the discriminated union properly?
          const body = record.body.data as ShapePolygon;
          entities.push({
            type: 'polygon',
            // NOTE: the types are messed up here too?
            points: body.points as unknown as Array<[number, number]>,
          });
        }
        // FIXME: parse more kinds of data here!
      }
    }

    results.set(subFile, entities);
  }

  return results;
}
