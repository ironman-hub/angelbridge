import { GetInvolved } from "@/components/GetInvolved";

type Tab = "volunteer" | "partner" | "sponsor";

export default function GetInvolvedPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = (["volunteer", "partner", "sponsor"].includes(searchParams.tab ?? "")
    ? searchParams.tab
    : "volunteer") as Tab;
  return (
    <div className="section max-w-2xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">Get involved</h1>
      <p className="mt-2 text-slate-600">
        Angel Bridge Foundation runs on people and partnerships. Volunteer your time, refer people who need us, or sponsor
        the supplies and vehicles that keep the response on the road.
      </p>
      <div className="mt-8">
        <GetInvolved initialTab={tab} />
      </div>
    </div>
  );
}
