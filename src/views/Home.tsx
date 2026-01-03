import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	BookmarkIcon,
	ChartBarIcon,
	ChatBubbleLeftRightIcon,
	DocumentTextIcon,
	IdentificationIcon,
	MagnifyingGlassIcon,
	PresentationChartLineIcon,
	UserCircleIcon
} from "@heroicons/react/24/outline";
import Seo from "../components/Seo";
import { JobIndexPostsApi } from "../findjobnu-api";
import type { CategoryJobCountResponse, JobStatisticsResponse } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";
import { getCategoryIcon } from "../helpers/categoryIcon";

const api = createApiClient(JobIndexPostsApi);

const formatNumber = (value?: number | null) => {
	const numeric = typeof value === "number" && Number.isFinite(value) ? value : null;
	return numeric != null ? new Intl.NumberFormat("da-DK").format(numeric) : "—";
};

const formatCategoryName = (name?: string | null) => {
	const value = (name ?? "").trim();
	return value.length > 16 ? `${value.slice(0, 16)}..` : value;
};

const Home: React.FC = () => {
	const [stats, setStats] = useState<JobStatisticsResponse | null>(null);
	const [statsLoading, setStatsLoading] = useState(false);
	const [statsError, setStatsError] = useState(false);

	useEffect(() => {
		let isActive = true;
		const loadStatistics = async () => {
			setStatsLoading(true);
			setStatsError(false);
			try {
				const data = await api.getJobStatistics();
				if (isActive) setStats(data ?? null);
			} catch {
				if (isActive) setStatsError(true);
			} finally {
				if (isActive) setStatsLoading(false);
			}
		};
		loadStatistics();
		return () => {
			isActive = false;
		};
	}, []);

	const featureCards: Array<{
		title: string;
		description: string;
		to?: string;
		tag?: string;
		icon: React.ReactNode;
	}> = [
		{
			title: "Jobsøgning",
			description: "Søg blandt alle danske jobopslag, filtrér på kategori og geografi, og gem dine fund.",
			to: "/jobsearch",
			tag: "Ny visning",
			icon: <MagnifyingGlassIcon className="w-5 h-5" aria-hidden="true" />
		},
		{
			title: "Arbejdssøgende univers",
			description: "Få en samlet indgang til guides, værktøjer og inspiration til din næste ansøgning.",
			to: "/arbejdssogende",
			icon: <UserCircleIcon className="w-5 h-5" aria-hidden="true" />
		},
		{
			title: "Det gode CV",
			description: "Læs hvordan du bygger et CV, der bliver set. Følg konkrete eksempler og tjeklister.",
			to: "/cv",
			icon: <DocumentTextIcon className="w-5 h-5" aria-hidden="true" />
		},
		{
			title: "Profil og kompetencer",
			description: "Opdatér din profil, tilføj erfaring og færdigheder, og lad os matche dig bedre.",
			to: "/profile",
			icon: <IdentificationIcon className="w-5 h-5" aria-hidden="true" />
		},
		{
			title: "Gemte job og agenter",
			description: "Hold styr på gemte opslag og jobagenter, så du får besked om nye muligheder.",
			to: "/myjobs",
			icon: <BookmarkIcon className="w-5 h-5" aria-hidden="true" />
		},
		{
			title: "Support og spørgsmål",
			description: "Har du feedback eller brug for hjælp? Kontakt os direkte for at få svar.",
			to: "/contact",
			icon: <ChatBubbleLeftRightIcon className="w-5 h-5" aria-hidden="true" />
		},
		{
			title: "Jobindsigt",
			description: "Se et øjebliksbillede af det danske jobmarked med aktive opslag og nye trends.",
			tag: "Statistik",
			icon: <PresentationChartLineIcon className="w-5 h-5" aria-hidden="true" />
		}
	];

	const topCategories = (stats?.topCategories ?? []).slice(0, 6).filter((c): c is CategoryJobCountResponse => Boolean(c?.name));

	return (
		<div className="max-w-7xl w-full mx-auto px-4 pb-12">
			<Seo
				title="FindJob.nu – Din indgang til jobsøgning i Danmark"
				description="Få overblik over jobsøgning, CV-råd, profiler og statistik på FindJob.nu. Start med jobsøgningen, eller dyk ned i guides og værktøjer."
				path="/"
				jsonLd={{
					"@context": "https://schema.org",
					"@type": "WebSite",
					name: "FindJob.nu",
					url: "https://findjob.nu/",
					potentialAction: {
						"@type": "SearchAction",
						target: "https://findjob.nu/jobsearch?searchTerm={search_term_string}",
						"query-input": "required name=search_term_string"
					}
				}}
			/>

			<section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
				<div className="card bg-gradient-to-br from-primary/15 via-base-100 to-secondary/10 shadow-lg border border-primary/20">
					<div className="card-body p-8 flex flex-col gap-6">
						<div className="space-y-3">
							<p className="text-sm uppercase tracking-[0.2em] text-primary/80 font-semibold">Velkommen til FindJob.nu</p>
							<h1 className="text-3xl md:text-4xl font-bold leading-tight text-base-content">En samlet forside til jobsøgning, læring og overblik</h1>
							<p className="text-lg text-base-content/80 max-w-2xl">Find relevante job, opbyg dit CV og følg udviklingen på jobmarkedet. Vi har samlet de vigtigste funktioner ét sted, så du kan vælge det, der passer dig.</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Link to="/jobsearch" className="btn btn-primary btn-lg">Start jobsøgningen</Link>
							<Link to="/arbejdssogende" className="btn btn-outline btn-secondary btn-lg">Se værktøjer til jobsøgende</Link>
						</div>
						<div className="grid gap-3 md:grid-cols-3">
							<Link to="/cv" className="bg-base-100/80 rounded-box p-4 shadow-sm border border-base-200 hover:no-underline focus-visible:outline-none">
								<div className="flex items-center gap-2 text-sm text-base-content/70">
									<DocumentTextIcon className="w-5 h-5 text-primary" aria-hidden="true" />
									<span>Det gode CV</span>
								</div>
								<p className="text-xl font-semibold">Guides, eksempler og checklister</p>
							</Link>
							<Link to="/profile" className="bg-base-100/80 rounded-box p-4 shadow-sm border border-base-200 hover:no-underline focus-visible:outline-none">
								<div className="flex items-center gap-2 text-sm text-base-content/70">
									<IdentificationIcon className="w-5 h-5 text-secondary" aria-hidden="true" />
									<span>Profil og anbefalinger</span>
								</div>
								<p className="text-xl font-semibold">Tilpas din profil og få bedre match</p>
							</Link>
							<Link to="/myjobs" className="bg-base-100/80 rounded-box p-4 shadow-sm border border-base-200 hover:no-underline focus-visible:outline-none">
								<div className="flex items-center gap-2 text-sm text-base-content/70">
									<BookmarkIcon className="w-5 h-5 text-accent" aria-hidden="true" />
									<span>Gemte job</span>
								</div>
								<p className="text-xl font-semibold">Følg dine fund og jobagenter</p>
							</Link>
						</div>
					</div>
				</div>

				<div className="card bg-base-100 shadow-lg border border-base-200">
					<div className="card-body p-6 flex flex-col gap-4">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-sm uppercase tracking-[0.2em] text-base-content/70 font-semibold">Jobindsigt</p>
								<h2 className="text-2xl font-bold">Aktuelle nøgletal fra jobmarkedet</h2>
								<p className="text-base text-base-content/70">Data opdateres fra JobIndex og viser et hurtigt overblik over nye og aktive opslag.</p>
							</div>
							{statsLoading && <span className="loading loading-spinner loading-md text-primary" aria-label="Henter statistik" />}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							{[
								{ label: "Aktive jobopslag", value: formatNumber(stats?.totalJobs), icon: <ChartBarIcon className="w-5 h-5 text-primary" aria-hidden="true" /> },
								{ label: "Nye job i sidste uge", value: formatNumber(stats?.newJobsLastWeek), icon: <PresentationChartLineIcon className="w-5 h-5 text-secondary" aria-hidden="true" /> },
								{ label: "Nye job i sidste måned", value: formatNumber(stats?.newJobsLastMonth), icon: <ChartBarIcon className="w-5 h-5 text-accent" aria-hidden="true" /> }
							].map((item) => (
								<div key={item.label} className="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm">
									<div className="flex items-center gap-2 text-sm text-base-content/60">
										{item.icon}
										<span>{item.label}</span>
									</div>
									<p className="text-3xl font-bold text-base-content mt-2">{item.value}</p>
								</div>
							))}
						</div>

						<div>
							<p className="text-sm font-semibold text-base-content/80">Mest udbudte kategorier</p>
							<div className="mt-3 grid auto-rows-fr gap-3 sm:grid-cols-2">
								{topCategories.length === 0 && !statsLoading && (
									<span className="text-base-content/60 text-sm">Ingen data tilgængelig endnu.</span>
								)}
								{topCategories.map((category) => {
									const icon = getCategoryIcon(category.name);
									const card = (
										<div className="flex h-full items-center justify-between gap-3 rounded-box border border-base-200 bg-base-100 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
													{icon}
												</div>
												<div className="flex flex-col">
													<span className="text-base font-semibold text-base-content" title={category.name ?? undefined}>{formatCategoryName(category.name)}</span>
													<span className="text-sm text-base-content/70">{formatNumber(category.numberOfJobs)} opslag</span>
												</div>
											</div>
											<span className="text-primary font-semibold text-sm">Se job →</span>
										</div>
									);
									return category.id != null ? (
										<Link
											key={category.id}
											to={`/jobsearch?category=${category.id}`}
											className="block h-full hover:no-underline focus-visible:outline-none"
										>
											{card}
										</Link>
									) : (
										<div key={category.name} className="h-full">{card}</div>
									);
								})}
							</div>
						</div>

						{statsError && (
							<div className="alert alert-warning">
								<span>Kunne ikke hente statistik lige nu. Prøv igen senere.</span>
							</div>
						)}
					</div>
				</div>
			</section>

			<section className="mt-10">
				<div className="flex items-center justify-between flex-wrap gap-3 mb-4">
					<div>
						<p className="text-sm uppercase tracking-[0.2em] text-base-content/70 font-semibold">Overblik</p>
						<h2 className="text-2xl font-bold">Vælg den del af FindJob.nu, du vil bruge</h2>
						<p className="text-base text-base-content/70">Hop direkte til den funktion, der hjælper dig nu – fra jobsøgning og CV til jobagenter.</p>
					</div>
				</div>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{featureCards.map((card) => {
						const content = (
							<div className="h-full flex flex-col gap-3 p-5 rounded-box border border-base-200 bg-base-100 shadow-sm hover:shadow-md transition-shadow">
									<div className="flex items-center gap-2">
										<div className="flex items-center justify-center w-10 h-10 rounded-full bg-base-200 text-base-content/80">
											{card.icon}
										</div>
										<h3 className="text-xl font-semibold text-base-content">{card.title}</h3>
										{card.tag && <span className="badge badge-outline badge-primary">{card.tag}</span>}
								</div>
								<p className="text-base text-base-content/70 flex-1">{card.description}</p>
								{card.to ? (
									<span className="link link-primary font-semibold">Gå til {card.title.toLowerCase()}</span>
								) : (
									<span className="text-sm text-base-content/60">Ingen navigation, kun overblik.</span>
								)}
							</div>
						);

						return card.to ? (
							<Link key={card.title} to={card.to} className="group focus-visible:outline-none">
								{content}
							</Link>
						) : (
							<div key={card.title}>{content}</div>
						);
					})}
				</div>
			</section>

			<section className="mt-12 grid gap-6 lg:grid-cols-3">
				<div className="card bg-base-100 border border-base-200 shadow-sm lg:col-span-2">
					<div className="card-body gap-4">
						<h3 className="text-xl font-bold">Sådan kommer du i gang</h3>
						<ul className="list-disc list-inside space-y-2 text-base-content/80">
							<li>Start i jobsøgningen for at få et hurtigt overblik over aktuelle opslag.</li>
							<li>Opdatér din profil med erfaring og færdigheder for at få mere relevante anbefalinger.</li>
							<li>Læs vores guide til det gode CV, og brug den som tjekliste, inden du sender ansøgninger.</li>
							<li>Opret jobagenter og gem interessante opslag, så du kan følge op senere.</li>
						</ul>
					</div>
				</div>
				<div className="card bg-secondary text-secondary-content shadow-sm">
					<div className="card-body gap-4">
						<h3 className="text-xl font-bold">Tip: Brug data i din søgning</h3>
						<p className="text-secondary-content/90">Kig på de mest udbudte kategorier og de nye tendenser fra den seneste uge, før du målretter dit næste søgeord.</p>
						<Link to="/jobsearch" className="btn btn-outline border-secondary-content text-secondary-content">Se job og filtrér nu</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;