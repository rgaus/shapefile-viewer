import { useCallback } from 'react';
import parseShapefile from '@/lib/parse-shapefile';
import useShapefileDataContext from '@/contexts/shapefile-data';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from 'lucide-react';

const UploadShapefile: React.FunctionComponent<{}> = () => {
  const { data, onMarkDataProcessing, onMarkDataError, onLoadData } = useShapefileDataContext();

  const onDrop = useCallback(async (acceptedFiles: Array<File>) => {
    if (acceptedFiles.length > 1) {
      onMarkDataError('Multiple files were uploaded - this is not supported. Please select only one shapefile.');
      return;
    }
    const file = acceptedFiles[0];

    onMarkDataProcessing();
    const arrayBuffer = await file.arrayBuffer();

    let result;
    try {
      result = await parseShapefile(arrayBuffer);
    } catch (err) {
      console.error('Error processing shapefile:', err);
      onMarkDataError('Error processing shapefile - are you sure this is correctly formatted? This tool only supports zip files containing corresponding xxx.shp / xxx.prj files.');
      return;
    }

    onLoadData(result.metadataList, result.center);
  }, [onMarkDataProcessing, onMarkDataError, onLoadData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className={cn(
      "fixed inset-0 bg-background/50 z-1001 flex items-center justify-center transition-opacity",
      {
        "opacity-0 pointer-events-none": data.status === 'ready',
      }
    )}>
      <div className="rounded p-8 w-[480px] h-[320px] bg-background flex flex-col gap-3 border" {...getRootProps()}>
        <h2 className="text-xl font-bold">Welcome to the Shapefile Viewer!</h2>
        <p className="text-md">
          A <a href="https://en.wikipedia.org/wiki/Shapefile" rel="noreferrer noopener">shapefile</a> contains
          geographic information about where important assets are located.
        </p>

        {data.status === 'error' ? (
          <div>
            {data.message}
          </div>
        ) : null}

        {data.status === 'idle' || data.status === 'error' ? (
          <div className={cn(
            "flex flex-col gap-3 items-center justify-center border rounded h-[220px] mt-4 cursor-pointer",
            { "bg-gray-100 dark:bg-gray-800": isDragActive },
          )}>
            {isDragActive ? (
              <span>Drop to upload</span>
            ) : (
              <>
                <UploadIcon size={32} />
                <span className="mt-1">Drop or click to upload shapefile</span>
                <span className="text-gray-500 dark:text-gray-300 text-xs">(one xxx.zip file)</span>
                <input {...getInputProps()} />
              </>
            )}
          </div>
        ) : null}

        {data.status === 'processing' ? (
          <div className="flex flex-col items-center justify-center h-[220px] mt-4">
            <span>Processing...</span>
          </div>
        ) : null}
      </div>
    </div>
  )
};

export default UploadShapefile;
