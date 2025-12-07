"use client";

import {
  ComposableMap,
  createCoordinates,
  Geographies,
  Geography,
  Marker,
} from "@vnedyalk0v/react19-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scaleLinear } from "d3-scale";
import { Map } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
const geoUrl = "https://unpkg.com/world-atlas@2/countries-110m.json";

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
        <div className="h-fit w-full">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 100,
              center: createCoordinates(0, 0),
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) => {
                return geographies.map((geo, index) => {
                  const geoKey =
                    geo.properties?.NAME ||
                    geo.properties?.NAME_LONG ||
                    geo.properties?.ISO_A3 ||
                    geo.id ||
                    `geo-${index}`;

                  return (
                    <Geography
                      key={geoKey}
                      geography={geo}
                      fill="#EAEAEC"
                      stroke="#D6D6DA"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: "#c0a994",
                          outline: "none",
                          strokeWidth: 1,
                        },
                        pressed: { outline: "none" },
                      }}
                      className="transition-all duration-300"
                    />
                  );
                });
              }}
            </Geographies>
            {data.map((loc, index) => (
              <Tooltip key={`marker-${loc.latitude}-${loc.longitude}-${index}`}>
                <TooltipTrigger asChild>
                  <Marker
                    key={`marker-${loc.latitude}-${loc.longitude}-${index}`}
                    coordinates={createCoordinates(loc.longitude, loc.latitude)}
                  >
                    <circle
                      r={sizeScale(loc.count)}
                      fill="#6a4f39"
                      stroke="#fff"
                      strokeWidth={1}
                    />
                    <title>{`${loc.city}, ${loc.country}: ${loc.count}`}</title>
                  </Marker>
                </TooltipTrigger>
                <TooltipContent className="bg-primary text-primary-foreground">
                  <p className="text-sm">
                    {loc.city}, {loc.country}
                  </p>
                  <p className="text-sm">{loc.count} visits</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </ComposableMap>
        </div>
      </CardContent>
    </Card>
  );
}
