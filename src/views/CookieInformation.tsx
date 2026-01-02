import React from "react";
import Seo from "../components/Seo";

const CookieInformation: React.FC = () => {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Seo
        title="Cookie-information | FindJob.nu"
        description="Se hvordan FindJob.nu bruger nødvendige og begrænsede ydeevne-cookies. Ingen salg eller deling af data via cookies."
        path="/cookie-information"
      />
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-3">
          <h1 className="text-3xl font-bold">Cookie-information</h1>
          <p className="text-base-content/70">
            Vi bruger cookies med måde. De er primært teknisk nødvendige for at holde dig logget ind og sikre stabil drift.
            Vi sælger eller deler ingen data om dig via cookies, og vi anvender kun analyser, hvor de er strengt nødvendige
            for at forbedre platformens ydeevne.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-2">
            <h2 className="text-xl font-semibold">Typer af cookies</h2>
            <ul className="list-disc ml-5 space-y-1 text-base-content/70">
              <li>Nødvendige: session- og sikkerhedscookies, der holder dig logget ind og beskytter kontoen.</li>
              <li>Præference: gemmer dine valg (f.eks. sprog), så oplevelsen bliver konsistent.</li>
              <li>Ydeevne (begrænset): anonymiseret måling af fejl og svartider for at forbedre platformen.</li>
            </ul>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-2">
            <h2 className="text-xl font-semibold">Sådan kan du styre cookies</h2>
            <ul className="list-disc ml-5 space-y-1 text-base-content/70">
              <li>Du kan altid slette eller blokere cookies via din browser.</li>
              <li>Hvis du blokerer nødvendige cookies, kan visse funktioner (f.eks. login) ophøre med at virke.</li>
              <li>For spørgsmål om cookies, kontakt os på <a className="link" href="mailto:info@findjob.nu">info@findjob.nu</a>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieInformation;
