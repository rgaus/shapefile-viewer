import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { LatLngCoordinate, ShapefileMetadata } from "@/lib/parse-shapefile";

type ShapefileData =
  | { status: 'idle' }
  | { status: 'processing' }
  | { status: 'error', message: string | null }
  | {
    status: 'ready',
    initialCenter: LatLngCoordinate,
    data: Array<ShapefileMetadata>,
  };

type ContextValue = {
  data: ShapefileData;
  onMarkDataProcessing: () => void;
  onMarkDataError: (message: string) => void;
  onLoadData: (data: Array<ShapefileMetadata>, initialCenter: LatLngCoordinate) => void;
};

const ShapefileDataContext = createContext<ContextValue | null>(null);

export const ShapefileDataProvider: React.FunctionComponent<{children: React.ReactNode}> = ({ children }) => {
  const [data, setData] = useState<ShapefileData>({ status: 'idle' });

  const onMarkDataProcessing = useCallback(() => {
    setData({ status: 'processing' });
  }, [setData]);

  const onMarkDataError = useCallback((message: string) => {
    setData({ status: 'error', message });
  }, [setData]);

  const onLoadData = useCallback((data: Array<ShapefileMetadata>, initialCenter: LatLngCoordinate) => {
    setData({ status: 'ready', data, initialCenter });
  }, [setData]);

  const providerValue: ContextValue = useMemo(() => ({
    data,
    onMarkDataProcessing,
    onMarkDataError,
    onLoadData,
  }), [data, onMarkDataProcessing, onMarkDataError, onLoadData]);

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
