import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useState } from "react";

const RadialGauge = dynamic(
  () => import("reaviz").then((mod) => mod.RadialGauge),
  {
    ssr: false,
  }
);

const RadialGaugeSeries = dynamic(
  () => import("reaviz").then((mod) => mod.RadialGaugeSeries),
  {
    ssr: false,
  }
);

const RadialGaugeArc = dynamic(
  () => import("reaviz").then((mod) => mod.RadialGaugeArc),
  {
    ssr: false,
  }
);

const Gradient = dynamic(() => import("reaviz").then((mod) => mod.Gradient), {
  ssr: false,
});

export default function RVRadialCharts(props: any) {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    setCategoryData(props.data);
  }, [props.data]);

  let defData = [
    { key: "Speech Skills", data: 10 },
    { key: "Technical Knowledge", data: 10 },
    { key: "Communication", data: 10 },
    { key: "Problem Solving", data: 10 },
  ];

  const colorScheme: string[] = ["#992dbd", "#eb9310", "#00ECB1", "royalblue"];

  return (
    <RadialGauge
      id="multi"
      className="radial-gauge"
      data={categoryData}
      startAngle={0}
      endAngle={Math.PI * 2}
      height={180}
      width={700}
      minValue={0}
      maxValue={100}
      series={
        <RadialGaugeSeries
          colorScheme={colorScheme}
          arcWidth={8}
          innerArc={
            <RadialGaugeArc cornerRadius={12.5} gradient={<Gradient />} />
          }
          // className="radial-series"
        />
      }
    />
  );
}
