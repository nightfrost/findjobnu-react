import React from "react";
import illuBusiness from "../assets/illustrations/undraw_businesswoman-avatar_ktl2.svg";
import illuFileSearch from "../assets/illustrations/undraw_file-search_cbur.svg";
import illuCertification from "../assets/illustrations/undraw_certification_i2m0.svg";

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
        title: "Vi gør jobsøgning menneskelig med data",
        text:
            "Findjobnu kombinerer markedsdata med menneskelig indsigt, så kandidater og virksomheder kan mødes på et solidt grundlag. Vi er optaget af transparens, kvalitet og fairness i hver eneste anbefaling.",
        bullets: [
            "Data fra danske jobportaler og arbejdsgiverindsigt i ét overblik",
            "Anbefalinger, der tager højde for både kompetencer og ambitioner",
            "Tæt samarbejde med uddannelses- og erhvervspartnere for at holde alt opdateret",
        ],
        image: illuFileSearch,
        imageAlt: "Illustration af jobdata",
        badges: ["Data", "Indsigt", "Transparens"],
    },
    {
        title: "Vi er med dig gennem hele rejsen",
        text:
            "CV, ansøgning, jobsamtale – vi hjælper dig i hver fase. Med vores værktøjer kan du måle effekten af dine dokumenter, få råd til samtalen og holde styr på ansøgningerne.",
        bullets: [
            "Guides og værktøjer målrettet danske rekrutteringsprocesser",
            "Automatisk tjek af CV-læsbarhed og nøgleord",
            "Gennemtænkt onboarding og support for virksomheder",
        ],
        image: illuCertification,
        imageAlt: "Illustration af læringsrejse",
        badges: ["Støtte", "Værktøjer", "Samarbejde"],
    },
    {
        title: "Et team af specialister i jobmarkedet",
        text:
            "Vores hold består af rekrutteringskonsulenter, data scientists og produktfolk, der selv har prøvet at sidde på begge sider af bordet. Det giver os en jordnær tilgang og løsninger, der virker.",
        bullets: [
            "10+ års erfaring fra HR-tech, rekruttering og public sector",
            "Fokus på tilgængelighed og inklusion i alle produkter",
            "Partnerskaber med brancheorganisationer og jobcentre",
        ],
        image: illuBusiness,
        imageAlt: "Illustration af team",
        badges: ["Erfaring", "Inklusion", "Partnerskaber"],
    },
];

const values = [
    {
        title: "Garderobe af viden",
        description: "Vi deler alt vi lærer, så både kandidater og arbejdsgivere kan træffe bedre valg.",
    },
    {
        title: "Design for alle",
        description: "Tilgængelighed, tydelig sprogbrug og respekt for tiden hos travle kandidater.",
    },
    {
        title: "Handling før hypen",
        description: "Vi bygger praktiske løsninger, der løser konkrete problemer i hverdagen.",
    },
];

const About: React.FC = () => {
    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="hero bg-base-100 rounded-box border shadow-sm mb-10">
                <div className="hero-content text-center">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold">Om Findjobnu</h1>
                        <p className="text-base-content/70 mt-2">
                            Vi hjælper kandidater og virksomheder med at finde hinanden hurtigere og bedre. Findjobnu er bygget i Danmark, til det danske jobmarked, med fokus på transparens og fairness.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <span className="badge badge-primary badge-outline">Mission</span>
                            <span className="badge badge-secondary badge-outline">Gennemsigtighed</span>
                            <span className="badge badge-accent badge-outline">Kandidatfokus</span>
                        </div>
                        <div className="rounded-box border mt-6 grid gap-3 text-left bg-base-200 p-4">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Grundlagt</span>
                                <span className="text-base-content/70">2025 i Aalborg</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Team</span>
                                <span className="text-base-content/70">2 specialister i data, HR og produkt</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Fokus</span>
                                <span className="text-base-content/70">Jobsøgning, cv-optimering og talent matching</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-6 md:p-8 gap-10">
                    {sections.map((s, index) => (
                        <React.Fragment key={s.title}>
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                                {index % 2 === 0 ? (
                                    <>
                                        <div className="rounded-box border p-6 h-full flex flex-col">
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
                                        <figure className="p-6 h-full flex items-center justify-center">
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
                                        <figure className="p-6 h-full flex items-center justify-center">
                                            <img
                                                src={s.image}
                                                alt={s.imageAlt}
                                                className="w-full h-64 md:h-72 object-contain"
                                                loading="lazy"
                                            />
                                        </figure>
                                        <div className="rounded-box border p-6 h-full flex flex-col">
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
                            {index < sections.length - 1 && <div className="divider my-0" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="divider my-10" />

            <div>
                <h3 className="text-xl font-semibold mb-3">Vores værdier</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {values.map((value) => (
                        <div key={value.title} className="rounded-box border bg-base-100 p-6">
                            <h4 className="text-lg font-semibold">{value.title}</h4>
                            <p className="text-base-content/70 mt-2">{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
