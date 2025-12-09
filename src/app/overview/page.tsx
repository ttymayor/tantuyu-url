import GrowthRateBlock from "@/components/overview/GrowthRateBlock";
import OverviewAreaChart from "@/components/overview/OverviewAreaChart";

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-4">
      <GrowthRateBlock />
      <OverviewAreaChart />
    </div>
  );
}
