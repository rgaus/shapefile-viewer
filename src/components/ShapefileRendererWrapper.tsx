import dynamic from 'next/dynamic';

export default dynamic(() => import("./ShapefileRenderer"), {
  ssr: false,
});
