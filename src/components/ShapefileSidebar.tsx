import useShapefileDataContext from "@/contexts/shapefile-data";

const ShapefileSidebar: React.FunctionComponent = () => {
  const { data } = useShapefileDataContext();

  return (
    <div className="flex flex-col w-[400px] px-2 border-r">
      {data.status === 'idle' ? (
        <div className="flex items-center justify-center w-full h-full">
          <span className="dark:text-gray-100 text-gray-800">No data loaded</span>
        </div>
      ) : null}
      {data.status === 'processing' ? (
        <div className="flex items-center justify-center w-full h-full">
          <span className="dark:text-gray-100 text-gray-800">Processing...</span>
        </div>
      ) : null}
      {data.status === 'ready' ? (
        <>
          <div className="grow-0 shrink-0 flex items-center h-10 bg-background">
            <span className="font-bold">Subfiles</span>
          </div>
          <div className="overflow-auto">
            {data.data.map(metadata => (
              <div className="flex items-center h-6" key={metadata.id}>
                <span className="truncate select-none">{metadata.name}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ShapefileSidebar;
