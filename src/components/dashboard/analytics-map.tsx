"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scaleLinear } from "d3-scale";
import { Map } from "lucide-react";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  count: number;
}

export function AnalyticsMap({ data }: { data: LocationData[] }) {
  const sizeScale = scaleLinear()
    .domain([0, Math.max(...data.map((d) => d.count))])
    .range([4, 10]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map />
          User Locations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full overflow-hidden rounded-md border bg-slate-100 dark:bg-slate-900">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 100 }}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#EAEAEC"
                    stroke="#D6D6DA"
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#F53", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {data.map((loc, index) => (
              <Marker key={index} coordinates={[loc.longitude, loc.latitude]}>
                <circle
                  r={sizeScale(loc.count)}
                  fill="#FF5533"
                  stroke="#fff"
                  strokeWidth={2}
                />
                <title>{`${loc.city}, ${loc.country}: ${loc.count}`}</title>
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </CardContent>
    </Card>
  );
}
