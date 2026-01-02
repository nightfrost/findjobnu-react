import React from "react";
import { BriefcaseIcon, DocumentTextIcon, IdentificationIcon, UserIcon } from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext.shared";
import RecommendedJobs from "../components/RecommendedJobs";
import Seo from "../components/Seo";

const JobSeeker: React.FC = () => {
  const { user } = useUser();
  const userId = user?.userId ?? "";

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <Seo
        title="Arbejdssøgende – Værktøjer til CV, profil og jobagent | FindJob.nu"
        description="Få bedre matches, optimer dit CV til ATS, og aktiver jobagenter der finder relevante stillinger for dig."
        path="/arbejdssogende"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Forside", item: "https://findjob.nu/" },
            { "@type": "ListItem", position: 2, name: "Arbejdssøgende", item: "https://findjob.nu/arbejdssogende" }
          ]
        }}
      />
      <div className="hero bg-base-100 rounded-box shadow-xl mb-10">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
              <span>For dig der søger job</span>
              <UserIcon className="w-8 h-8 text-primary" aria-hidden="true" />
            </h1>
            <p className="text-base-content/70 mt-2">
              Brug vores værktøjer til at lande samtalen hurtigere: et CV der scorer højt i ATS, en udfyldt profil der matcher dig med de rigtige job, og en jobagent der holder dig opdateret.
            </p>
            <div className="mt-4 flex justify-center gap-2 flex-wrap">
              <span className="badge badge-primary badge-outline">Det gode CV</span>
              <span className="badge badge-secondary badge-outline">Profil</span>
              <span className="badge badge-accent badge-outline">Jobagent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mb-10">
        <div className="card-body p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-box border p-6 h-full flex flex-col gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>Det gode CV</span>
                <DocumentTextIcon className="w-5 h-5 text-primary" aria-hidden="true" />
              </h2>
              <p className="text-base-content/80">
                Øg din ATS-score med tydelig struktur, de rigtige nøgleord og et layout der kan læses af både systemer og mennesker.
              </p>
              <ul className="list-disc ml-5 space-y-1 text-base-content/80">
                <li>Automatisk tjek af nøgleord og læsbarhed</li>
                <li>Klar guide til PDF, sektioner og sprog</li>
              </ul>
              <a href="/cv" className="btn btn-primary btn-sm w-fit mt-auto">Se CV-guiden</a>
            </div>

            <div className="rounded-box border p-6 h-full flex flex-col gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>Profil</span>
                <IdentificationIcon className="w-5 h-5 text-secondary" aria-hidden="true" />
              </h2>
              <p className="text-base-content/80">
                En komplet profil gør dine anbefalinger skarpere og genbruger dine oplysninger, så du slipper for gentagelser.
              </p>
              <ul className="list-disc ml-5 space-y-1 text-base-content/80">
                <li>Matches på kompetencer, branche og geografi</li>
                <li>Del samme data på tværs af ansøgninger</li>
              </ul>
              <a href="/profile" className="btn btn-secondary btn-sm w-fit mt-auto">Udfyld profil</a>
            </div>

            <div className="rounded-box border p-6 h-full flex flex-col gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>Jobagent</span>
                <BriefcaseIcon className="w-5 h-5 text-accent" aria-hidden="true" />
              </h2>
              <p className="text-base-content/80">
                Jobagenten holder øje for dig og sender besked, så du kan reagere hurtigt på relevante opslag.
              </p>
              <ul className="list-disc ml-5 space-y-1 text-base-content/80">
                <li>Notifikationer når nye opslag matcher dig</li>
                <li>Skift filter hurtigt uden at miste historik</li>
              </ul>
              <a href="/profile?panel=jobAgent" className="btn btn-accent btn-sm w-fit mt-auto">Aktivér jobagent</a>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0 sm:p-4 lg:p-6">
          {userId ? (
            <RecommendedJobs userId={userId} />
          ) : (
            <div className="p-6 text-center space-y-3">
              <h2 className="text-2xl font-semibold">Se dine anbefalede jobs</h2>
              <p className="text-base-content/70">
                Log ind for at få personlige jobforslag baseret på din profil og dine præferencer.
              </p>
              <div className="flex justify-center gap-3">
                <a className="btn btn-primary" href="/login">Log ind</a>
                <a className="btn btn-outline" href="/register">Opret bruger</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSeeker;
