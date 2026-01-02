import React, { useState } from "react";
import {
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    BuildingOffice2Icon,
    PhoneIcon,
    PaperAirplaneIcon,
    BellAlertIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import illuContact from "../assets/illustrations/undraw_contact_support.svg";
import illuUpdate from "../assets/illustrations/undraw_my-notifications.svg";
import Seo from "../components/Seo";
import { createNewsletterClient } from "../helpers/ApiFactory";

const contactMethods = [
    {
        title: "Support til kandidater",
        description: "Skriv til os, hvis du har spørgsmål til din profil, ansøgninger eller CV-analyse.",
        detail: "support@findjob.nu",
        badge: "Svar inden 24 timer",
        Icon: ChatBubbleLeftRightIcon,
    },
    {
        title: "Virksomhedssamarbejder",
        description: "Lad os tale om rekruttering, employer branding eller talentprogrammer.",
        detail: "partners@findjob.nu",
        badge: "Skræddersyede løsninger",
        Icon: BuildingOffice2Icon,
    },
    {
        title: "Telefon",
        description: "Ring til os på hverdage mellem 9 og 16 (GMT+1).",
        detail: "+45 70 12 34 56",
        badge: "Direkte kontakt",
        Icon: PhoneIcon,
    },
];

const faqs = [
    {
        question: "Hvornår får jeg svar?",
        answer:
            "Vi bestræber os på at besvare alle henvendelser inden for én arbejdsdag. Skriv gerne så præcist som muligt, så kan vi hjælpe hurtigere.",
    },
    {
        question: "Kan I hjælpe med at skrive mit CV?",
        answer:
            "Vi tilbyder ikke ghostwriting, men du finder guider, læsbarhedsanalyse og feedbackskabeloner, så du kan gøre det selv.",
    },
    {
        question: "Hvordan bliver jeg partner?",
        answer:
            "Send os en mail med en kort introduktion, så vender vores partnerskabsteam tilbage med et mødeforslag.",
    },
];

const Contact: React.FC = () => {
    const [message, setMessage] = useState("");
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "exists" | "error">("idle");
    const [newsletterError, setNewsletterError] = useState<string | null>(null);

    const handleNewsletterSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newsletterEmail.trim()) return;
        setNewsletterStatus("loading");
        setNewsletterError(null);
        try {
            const api = createNewsletterClient();
            const res = await api.subscribeNewsletter({
                newsletterSubscribeRequest: { email: newsletterEmail.trim() }
            });
            if (res.alreadySubscribed) {
                setNewsletterStatus("exists");
            } else {
                setNewsletterStatus("success");
            }
        } catch (err) {
            console.error("Newsletter subscribe failed", err);
            setNewsletterStatus("error");
            setNewsletterError("Kunne ikke tilmelde nyhedsbrevet lige nu. Prøv igen senere.");
        }
    };

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <Seo
                title="Kontakt FindJob.nu – Support, partnerskab og feedback"
                description="Kontakt FindJob.nu for support, partnerskaber eller feedback. Vi svarer normalt inden for én arbejdsdag."
                path="/contact"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "ContactPage",
                    name: "Kontakt FindJob.nu",
                    url: "https://findjob.nu/contact",
                    mainEntity: {
                        "@type": "Organization",
                        name: "FindJob.nu",
                        url: "https://findjob.nu/",
                        contactPoint: {
                            "@type": "ContactPoint",
                            email: "support@findjob.nu",
                            contactType: "customer support",
                            areaServed: "DK",
                            availableLanguage: ["da", "en"]
                        }
                    }
                }}
            />
            <div className="hero bg-base-100 shadow-xl rounded-box mb-10">
                <div className="hero-content text-center">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
                            <span>Kontakt Findjobnu</span>
                            <EnvelopeIcon className="w-8 h-8 text-primary" aria-hidden="true" />
                        </h1>
                        <p className="text-base-content/70 mt-2">
                            Vi er klar til at hjælpe dig – uanset om du søger job, rekrutterer eller bare er nysgerrig. Vælg den kanal der passer dig bedst, så vender vi hurtigt tilbage.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <span className="badge badge-primary badge-outline">Support</span>
                            <span className="badge badge-secondary badge-outline">Partnerskab</span>
                            <span className="badge badge-accent badge-outline">Feedback</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {contactMethods.map((method) => (
                    <div key={method.title} className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title text-2xl flex items-center justify-between gap-3">
                                <span>{method.title}</span>
                                <method.Icon className="w-7 h-7 text-primary" aria-hidden="true" />
                            </h2>
                            <p className="text-base-content/70">{method.description}</p>
                            <div className="font-semibold text-lg">{method.detail}</div>
                            <div className="mt-3">
                                <span className="badge badge-outline">{method.badge}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card bg-base-100 shadow-xl mb-10">
                <div className="card-body p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <figure className="p-6 flex items-center justify-center">
                        <img
                            src={illuContact}
                            alt="Illustration af kontakt"
                            className="w-full h-72 object-contain"
                            loading="lazy"
                        />
                    </figure>
                    <div className="rounded-box border p-6 h-full bg-base-200/30">
                        <h2 className="text-2xl font-semibold flex items-center justify-between gap-2">
                            <span>Send os en besked</span>
                            <PaperAirplaneIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                        </h2>
                        <p className="text-base-content/70 mt-2">
                            Brug formularen, hvis du vil dele feedback, fejl eller idéer. Vi læser alt og svarer hurtigst muligt.
                        </p>
                        <form className="mt-4" aria-label="Kontaktformular">
                            <fieldset className="fieldset gap-4">
                                <legend className="fieldset-legend text-xl font-semibold">Send os en besked</legend>
                                <div className="form-control gap-2">
                                    <label className="label p-0" htmlFor="contact-name">
                                        <span className="label-text">Navn</span>
                                    </label>
                                    <input id="contact-name" type="text" className="input input-bordered w-full" placeholder="Dit navn" />
                                </div>
                                <div className="form-control gap-2">
                                    <label className="label p-0" htmlFor="contact-email">
                                        <span className="label-text">E-mail</span>
                                    </label>
                                    <input id="contact-email" type="email" className="input input-bordered w-full" placeholder="dig@eksempel.dk" />
                                </div>
                                <div className="form-control gap-2">
                                    <label className="label p-0" htmlFor="contact-message">
                                        <span className="label-text">Besked</span>
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        className="textarea textarea-bordered min-h-32 w-full"
                                        placeholder="Fortæl os hvad du har på hjertet"
                                        value={message}
                                        onChange={(event) => setMessage(event.target.value)}
                                    />
                                </div>
                                <button type="button" className="btn btn-primary" disabled={message.trim().length === 0}>
                                    Send besked
                                </button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-6 md:p-8 space-y-8">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="rounded-box border p-6">
                            <h3 className="text-xl font-semibold flex items-center justify-between gap-2">
                                <span>Hold dig opdateret</span>
                                <BellAlertIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                            </h3>
                            <p className="text-base-content/70 mt-2">
                                Vi deler hver måned et kort overblik over nye funktioner, workshops og indsigter fra jobmarkedet. Tilmeld dig direkte i appen under indstillinger.
                            </p>
                            <ul className="list-disc ml-5 mt-3 space-y-1 text-base-content/80">
                                <li>Produktnyheder og vejledninger</li>
                                <li>Events og webinarer for kandidater og virksomheder</li>
                                <li>Tips til at få mest muligt ud af Findjobnu</li>
                            </ul>
                            <form className="mt-4 space-y-2" onSubmit={handleNewsletterSubmit} aria-label="Nyhedsbrev">
                                <label className="label p-0" htmlFor="newsletter-email">
                                    <span className="label-text">Tilmeld nyhedsbrevet</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        id="newsletter-email"
                                        type="email"
                                        required
                                        className="input input-bordered w-full"
                                        placeholder="din@email.dk"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        aria-describedby="newsletter-help"
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={newsletterStatus === "loading"}
                                    >
                                        {newsletterStatus === "loading" ? "Tilmelder..." : "Tilmeld"}
                                    </button>
                                </div>
                                <p id="newsletter-help" className="text-sm text-base-content/60">Du kan afmelde dig når som helst via link i e-mailen.</p>
                                {newsletterStatus === "success" && (
                                    <div className="alert alert-success">
                                        <span>Tak! Du er tilmeldt nyhedsbrevet.</span>
                                    </div>
                                )}
                                {newsletterStatus === "exists" && (
                                    <div className="alert alert-info">
                                        <span>Du er allerede tilmeldt nyhedsbrevet.</span>
                                    </div>
                                )}
                                {newsletterStatus === "error" && (
                                    <div className="alert alert-error">
                                        <span>{newsletterError}</span>
                                    </div>
                                )}
                            </form>
                        </div>
                        <figure className="p-6 flex items-center justify-center">
                            <img
                                src={illuUpdate}
                                alt="Illustration af nyheder"
                                className="w-full h-64 object-contain"
                                loading="lazy"
                            />
                        </figure>
                    </section>

                    <div className="divider my-0" />

                    <section>
                        <h3 className="text-xl font-semibold mb-3 flex items-center justify-between gap-2">
                            <span>Ofte stillede spørgsmål</span>
                            <QuestionMarkCircleIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                        </h3>
                        <div className="space-y-2">
                            {faqs.map((faq) => (
                                <details key={faq.question} className="collapse collapse-arrow border bg-base-100">
                                    <summary className="collapse-title font-medium">{faq.question}</summary>
                                    <div className="collapse-content text-base-content/70">
                                        <p>{faq.answer}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Contact;
