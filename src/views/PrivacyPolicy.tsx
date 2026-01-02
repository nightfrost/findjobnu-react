import React from "react";
import Seo from "../components/Seo";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Seo
        title="Privatlivspolitik | FindJob.nu"
        description="Læs hvordan FindJob.nu beskytter dine data. Vi sælger eller deler aldrig dine oplysninger og bruger dem kun til at levere og forbedre tjenesten."
        path="/privatlivspolitik"
      />
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h1 className="text-3xl font-bold">Privatlivspolitik</h1>
          <p className="text-base-content/70">
            Vi beskytter dine oplysninger med største respekt. Vi sælger eller deler aldrig dine data med tredjeparter,
            og vi bruger dem kun til at levere og forbedre FindJob.nu. Når vi samarbejder med betroede underdatabehandlere,
            sker det kun med klare databehandleraftaler og strenge sikkerhedskrav.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-2">
            <h2 className="text-xl font-semibold">Hvilke data vi behandler</h2>
            <ul className="list-disc ml-5 space-y-1 text-base-content/70">
              <li>Kontodetaljer: navn, e-mail og eventuelle login-oplysninger.</li>
              <li>Profiler og CV-input, du selv tilføjer.</li>
              <li>Tekniske data: begrænset brugsstatistik for at sikre drift og forbedre oplevelsen.</li>
            </ul>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-2">
            <h2 className="text-xl font-semibold">Sådan bruger vi dine data</h2>
            <ul className="list-disc ml-5 space-y-1 text-base-content/70">
              <li>Levering af kernefunktioner som profil, jobagenter og CV-værktøjer.</li>
              <li>Support og fejlsøgning, når du kontakter os.</li>
              <li>Løbende forbedring af produktet baseret på anonymiserede mønstre.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-2">
            <h2 className="text-xl font-semibold">Deling og overførsel</h2>
            <p className="text-base-content/70">
              Vi deler ikke dine persondata med tredjeparter til markedsføring eller salg. Hvis vi anvender leverandører
              (f.eks. hosting eller e-mail), sker det udelukkende som databehandlere under vores instruktion og i overensstemmelse
              med gældende lovgivning.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-2">
            <h2 className="text-xl font-semibold">Opbevaring og sikkerhed</h2>
            <ul className="list-disc ml-5 space-y-1 text-base-content/70">
              <li>Adgangskontrol, kryptering og løbende overvågning af vores miljøer.</li>
              <li>Data opbevares kun så længe, det er nødvendigt for formålet eller lovgivningen kræver det.</li>
              <li>Du kan til enhver tid anmode om sletning af din konto og tilhørende data.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-2">
          <h2 className="text-xl font-semibold">Dine rettigheder</h2>
          <ul className="list-disc ml-5 space-y-1 text-base-content/70">
            <li>Indsigt: få en kopi af de oplysninger, vi behandler om dig.</li>
            <li>Berigtigelse: ret urigtige eller ufuldstændige data.</li>
            <li>Sletning: få slettet dine data, når de ikke længere er nødvendige.</li>
            <li>Indsigelse: gør indsigelse mod behandling, der bygger på legitime interesser.</li>
            <li>Dataportabilitet: få overført data til dig eller en anden udbyder, hvor det er relevant.</li>
          </ul>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-2">
          <h2 className="text-xl font-semibold">Kontakt</h2>
          <p className="text-base-content/70">
            Har du spørgsmål til, hvordan vi behandler dine data, eller ønsker du at gøre brug af dine rettigheder, kan du skrive til os på
            <a className="link ml-1" href="mailto:info@findjob.nu">info@findjob.nu</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
