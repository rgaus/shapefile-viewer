import { Shapefile, ShapePolygon, ShapeType } from 'shapefile.js';
import { v4 as uuidv4 } from 'uuid';
import proj4 from 'proj4';


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

    // Extract the projection information, and convert from the UTM coordinates into lat/lng
    // ref: https://stackoverflow.com/questions/31900600/python-and-shapefile-very-large-coordinates-after-importing-shapefile
    // ref: https://github.com/mbostock/shapefile/issues/27
    if (!shapefile.contents.prj) {
      console.warn(`Warning - no prj file found for ${subFile}, skipping...`);
      return null;
    }
    const projection = new TextDecoder().decode(shapefile.contents.prj);
    const converter = proj4(projection, "WGS84");

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
              return [converted.y, converted.x];
            }),
          });
        }
        // FIXME: parse more kinds of data here!
      }
    }

    return { id: uuidv4(), name: subFile, entities };
  }).filter((result): result is ShapefileMetadata => result !== null);
}
