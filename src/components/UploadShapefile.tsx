import { useCallback } from 'react';
import parseShapefile from '@/lib/parse-shapefile';

const UploadShapefile: React.FunctionComponent<{}> = () => {
  const parseFile = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const entities = await parseShapefile(arrayBuffer);
    console.log('>', entities);
  }, []);

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
