import { useCallback } from 'react';
import parseShapefile from '@/lib/parse-shapefile';
import useShapefileDataContext from '@/contexts/shapefile-data';

const UploadShapefile: React.FunctionComponent<{}> = () => {
  const { onMarkDataProcessing, onLoadData } = useShapefileDataContext();

  const parseFile = useCallback(async (file: File) => {
    onMarkDataProcessing();
    const arrayBuffer = await file.arrayBuffer();
    const result = await parseShapefile(arrayBuffer);
    onLoadData(result.metadataList, result.center);
  }, [onMarkDataProcessing, onLoadData]);

  return (
    <input
      type="file"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
          return;
        }

        const firstFile = e.target.files[0];
        if (!firstFile) {
          return;
        }

        parseFile(firstFile);
      }}
    />
  )
};

export default UploadShapefile;
