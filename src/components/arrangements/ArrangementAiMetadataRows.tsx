import ArrangementSourceTimeline from "@/components/arrangements/ArrangementSourceTimeline";
import {
  getArrangementRelatedSources,
  type ArrangementItem,
} from "@/data/arrangements";

export default function ArrangementAiMetadataRows({
  arrangement,
}: {
  arrangement: ArrangementItem;
}) {
  const sources = getArrangementRelatedSources(arrangement);
  return <ArrangementSourceTimeline sources={sources} />;
}
