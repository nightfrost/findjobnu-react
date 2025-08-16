import React, { useState } from "react";
import illuFileSearch from "../assets/illustrations/undraw_file-search_cbur.svg";
import illuPersonalInformation from '../assets/illustrations/undraw_personal-information_h7kf.svg';
import illuCertification from "../assets/illustrations/undraw_certification_i2m0.svg";
import { CVApi } from "../findjobnu-api";
import type { CvReadabilityResult } from "../findjobnu-api/models/CvReadabilityResult";
import { createApiClient } from "../helpers/ApiFactory";
import { useUser } from "../context/UserContext";
import { handleApiError } from "../helpers/ErrorHelper";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

type Section = {
    title: string;
    text: string;
    bullets: string[];
    image: string;
    imageAlt: string;
    badges: string[];
};

const sections: Section[] = [
    {
        title: "Gør det klart, kort og målrettet",
        text:
            "Brug en enkel, letlæselig struktur med tydelige sektioner (Profil, Erfaring, Uddannelse, Kompetencer). Fremhæv resultater og effekt frem for opgaver, og målret nøgleord til det specifikke job.",
        bullets: [
            "Brug handleverber og kvantificér effekten (fx ‘Øgede konvertering med 18%’)",
            "Undgå tekstvægge – brug punktopstilling (4–6 pr. rolle)",
            "Tilpas til hver ansøgning for bedre ATS-match",
        ],
        image: illuFileSearch,
        imageAlt: "Screening af CV'er illustration",
        badges: ["Klarhed", "Relevans", "Præcision"],
    },
    {
        title: "Lad den øverste tredjedel gøre arbejdet",
        text:
            "Rekrutterere skimmer. Læg dit stærkeste budskab øverst: en skarp profilsætning, dine 3–5 vigtigste kompetencer og seneste stilling. Hold kontaktinfo kort og professionel (mail, telefon, LinkedIn).",
        bullets: [
            "Skriv en 2–3 linjers profil, der matcher jobbet",
            "Indsæt relevante nøgleord naturligt",
            "Link til portfolio/GitHub når relevant",
        ],
        image: illuCertification,
        imageAlt: "Profil og nøgleord illustration",
        badges: ["Skimning", "Nøgleord", "Profil"],
    },
    {
        title: "Finpuds læsbarhed og troværdighed",
        text:
            "Konsistens skaber tillid. Brug samme tid, datoformat og opstilling. Undgå buzzwords, klichéer og stavefejl. Gem som PDF med læsevenlige skrifter og god kontrast.",
        bullets: [
            "Hold dig til én skrifttype og konsekvent spacing",
            "Foretræk omvendt kronologisk rækkefølge",
            "Korrekturlæs – små fejl kan koste samtalen",
        ],
        image: illuPersonalInformation,
        imageAlt: "Kvalitet og konsistens illustration",
        badges: ["Kvalitet", "Konsistens", "Læsbarhed"],
    },
];

const GoodCV: React.FC = () => {
    const { user } = useUser();
    const token = user?.accessToken ?? null;
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<CvReadabilityResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
        setResult(null);
        setError(null);
    };

    const onAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);
        setError(null);
        try {
            const api = createApiClient(CVApi, token ?? undefined);
            const res = await api.analyzeCvPdf({ file });
            setResult(res);
        } catch (err) {
            const info = await handleApiError(err);
            setError(info.message);
        } finally {
            setAnalyzing(false);
        }
    };
    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="hero bg-base-100 rounded-box border border-base-200 shadow-sm mb-10">
                <div className="hero-content text-center">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold">Det gode CV</h1>
                        <p className="text-base-content/70 mt-2">
                            Kort, målrettet og let at skimme. Brug tipsene her for at blive kaldt hurtigere til samtale – og for at klare dig bedre i ATS'er (Applicant Tracking System).
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <span className="badge badge-primary badge-outline">ATS-venligt</span>
                            <span className="badge badge-secondary badge-outline">Let at læse</span>
                            <span className="badge badge-accent badge-outline">Resultatfokus</span>
                        </div>

                        <div className="mt-6 text-left">
                            <div className="rounded-box border border-base-200 p-4">
                                <h2 className="text-lg font-semibold">Tjek læsbarheden af dit CV (PDF)
                                    <button
                                        type="button"
                                        className="tooltip tooltip-left"
                                        data-tip="Vi gemmer ikke pdf-dokument og/eller dine oplysninger. Score og data-udtræk slettes automatisk efter analyse."
                                        aria-label="Hjælp til Min Profil"
                                    >
                                        <QuestionMarkCircleIcon
                                            className="w-5 h-5 text-base-content/60 hover:text-base-content"
                                            aria-label="Hjælp"
                                        />
                                    </button>
                                </h2>
                                <div className="mt-3 flex flex-col md:flex-row md:items-center gap-3">
                                    <div className="form-control w-full md:w-auto">
                                        <span className="text-sm font-medium mb-1 block">Upload CV som PDF</span>
                                        <input
                                            id="cvFileInput"
                                            type="file"
                                            accept="application/pdf"
                                            className="file-input file-input-bordered w-full md:w-auto"
                                            onChange={onFileChange}
                                            aria-label="Upload CV som PDF"
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={onAnalyze}
                                        disabled={!file || analyzing}
                                    >
                                        {analyzing ? "Analyserer…" : "Analyser CV"}
                                    </button>
                                </div>

                                {error && (
                                    <div className="alert alert-error mt-3">
                                        <span>{error}</span>
                                    </div>
                                )}

                                {result && (
                                    <div className="mt-4 grid gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">Læsbarhedsscore:</span>
                                            <div className="flex items-center gap-2">
                                                <progress
                                                    className="progress progress-primary w-48"
                                                    value={(result.readabilityScore ?? 0) <= 1 ? Math.round(((result.readabilityScore ?? 0) * 100)) : Math.round(result.readabilityScore ?? 0)}
                                                    max={100}
                                                />
                                                <span className="text-sm text-base-content/70">
                                                    {((result.readabilityScore ?? 0) <= 1
                                                        ? Math.round(((result.readabilityScore ?? 0) * 100))
                                                        : Math.round(result.readabilityScore ?? 0))}%
                                                </span>
                                            </div>
                                        </div>
                                        {result.summary && (
                                            <div>
                                                <div className="font-medium">Opsummering</div>
                                                <p className="text-base-content/80">{result.summary}</p>
                                            </div>
                                        )}
                                        {result.extractedText && (
                                            <details className="collapse collapse-arrow bg-base-200 rounded-box">
                                                <summary className="collapse-title font-medium">Vis udtrukket tekst</summary>
                                                <div className="collapse-content">
                                                    <pre className="whitespace-pre-wrap text-sm text-base-content/80">{result.extractedText}</pre>
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-6 md:p-8 space-y-10">
                    {sections.map((s, i) => (
                        <React.Fragment key={s.title}>
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                                {i % 2 === 0 ? (
                                    <>
                                        <div className="rounded-box border border-base-200 p-6 h-full flex flex-col">
                                            <h2 className="text-2xl font-semibold">{s.title}</h2>
                                            <p className="text-base-content/80">{s.text}</p>
                                            <ul className="list-disc ml-5 mt-2 space-y-1 text-base-content/80">
                                                {s.bullets.map((b) => (
                                                    <li key={`${s.title}-${b}`}>{b}</li>
                                                ))}
                                            </ul>
                                            <div className="mt-auto pt-4 flex flex-wrap gap-2">
                                                {s.badges.map((badge) => (
                                                    <span key={`${s.title}-${badge}`} className="badge badge-outline">{badge}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <figure className="rounded-box border border-base-200 p-6 h-full flex items-center justify-center">
                                            <img
                                                src={s.image}
                                                alt={s.imageAlt}
                                                className="w-full h-64 md:h-72 object-contain"
                                                loading="lazy"
                                            />
                                        </figure>
                                    </>
                                ) : (
                                    <>
                                        <figure className="rounded-box border border-base-200 p-6 h-full flex items-center justify-center">
                                            <img
                                                src={s.image}
                                                alt={s.imageAlt}
                                                className="w-full h-64 md:h-72 object-contain"
                                                loading="lazy"
                                            />
                                        </figure>
                                        <div className="rounded-box border border-base-200 p-6 h-full flex flex-col">
                                            <h2 className="text-2xl font-semibold">{s.title}</h2>
                                            <p className="text-base-content/80">{s.text}</p>
                                            <ul className="list-disc ml-5 mt-2 space-y-1 text-base-content/80">
                                                {s.bullets.map((b) => (
                                                    <li key={`${s.title}-${b}`}>{b}</li>
                                                ))}
                                            </ul>
                                            <div className="mt-auto pt-4 flex flex-wrap gap-2">
                                                {s.badges.map((badge) => (
                                                    <span key={`${s.title}-${badge}`} className="badge badge-outline">{badge}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </section>
                            {i < sections.length - 1 && <div className="divider my-0" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="divider my-10" />

            <div>
                <h3 className="text-xl font-semibold mb-2">Yderligere læsning og kilder</h3>
                <ul className="list-disc ml-6 space-y-1">
                    <li>
                        UK National Careers Service — How to write a CV: {" "}
                        <a href="https://nationalcareers.service.gov.uk/careers-advice/cv-sections" target="_blank" rel="noopener noreferrer">
                            nationalcareers.service.gov.uk
                        </a>
                    </li>
                    <li>
                        Harvard OCS — Resume and Cover Letters: {" "}
                        <a href="https://ocs.fas.harvard.edu/resumes-cvs" target="_blank" rel="noopener noreferrer">
                            ocs.fas.harvard.edu
                        </a>
                    </li>
                    <li>
                        EU — Europass CV guidance: {" "}
                        <a href="https://europa.eu/europass/en/create-europass-cv" target="_blank" rel="noopener noreferrer">
                            europa.eu
                        </a>
                    </li>
                    <li>
                        LinkedIn — Tips to make your resume stand out: {" "}
                        <a href="https://www.linkedin.com/advice/0/how-do-you-make-your-resume-stand-out" target="_blank" rel="noopener noreferrer">
                            linkedin.com
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default GoodCV;
