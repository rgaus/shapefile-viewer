import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { LatLngCoordinate, ShapefileMetadata } from "@/lib/parse-shapefile";

type ShapefileData =
  | { status: 'uploading' }
  | { status: 'processing' }
  | {
    status: 'ready',
    initialCenter: LatLngCoordinate,
    data: Array<ShapefileMetadata>,
  };

type ContextValue = {
  data: ShapefileData;
  onMarkDataProcessing: () => void;
  onLoadData: (data: Array<ShapefileMetadata>, initialCenter: LatLngCoordinate) => void;
};

const ShapefileDataContext = createContext<ContextValue | null>(null);

export const ShapefileDataProvider: React.FunctionComponent<{children: React.ReactNode}> = ({ children }) => {
  const [data, setData] = useState<ShapefileData>({ status: 'uploading' });

  const onMarkDataProcessing = useCallback(() => {
    setData({ status: 'processing' });
  }, [setData]);

  const onLoadData = useCallback((data: Array<ShapefileMetadata>, initialCenter: LatLngCoordinate) => {
    setData({ status: 'ready', data, initialCenter });
  }, [setData]);

  const providerValue: ContextValue = useMemo(() => ({
    data,
    onMarkDataProcessing,
    onLoadData,
  }), [data, onMarkDataProcessing, onLoadData]);

  return (
    <ShapefileDataContext.Provider value={providerValue}>
      {children}
    </ShapefileDataContext.Provider>
  );
};

export default function useShapefileDataContext() {
  const data = useContext(ShapefileDataContext);
  if (!data) {
    throw new Error('Cannot use useShapefileDataContext hook outside of ShapefileDataProvider!');
  }
  return data;
}
