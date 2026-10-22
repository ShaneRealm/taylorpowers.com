#!/usr/bin/env python3
"""Generate the case-study pages in work/<slug>/index.html from PROJECTS.

Run from the repo root:  python3 scripts/build_work.py
Edit the data here, not the generated HTML. Facts come from Taylor's resume (v9) and
public coverage; don't add claims that aren't in either.
"""
import html, os, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
V = "14"  # bump with ?v= in index.html when CSS/JS change

PROJECTS = [
    dict(slug="superfile-trackhouse-nascar", client="SuperFile × Trackhouse Racing", title="Daytona 500",
         year="2026", role="VP of Brand, SuperFile", disciplines=["Sponsorship", "Livery", "Race-weekend activation", "VIP hospitality"],
         hero_img="/assets/img/daytona-race.jpg",
         lead="SuperFile arrived on NASCAR’s biggest stage: the black-and-volt #97 Chevrolet for Shane van Gisbergen at the Daytona 500.",
         body=["The Daytona 500 opened a multi-year partnership with Trackhouse Racing. Taylor oversaw the sponsorship rights, partner assets and brand integration, and built the event operation behind race-weekend hospitality for investors, clients and customers, from logistics and vendors to on-site execution.",
               "The program carried on through the season, including a Mr. Brainwash art car in Las Vegas, and extended into MotoGP with Trackhouse’s grand-prix team."],
         figures=[], link=("Race coverage", "https://speedcafe.com/nascar-news-2026-cup-series-shane-van-gisbergen-daytona-500-livery-svg-trackhouse-superfile/"),
         gallery=["/assets/img/daytona-race.jpg", "/assets/img/art-car.jpg"]),
    dict(slug="flex-lafc", client="FLEX × LAFC", title="Front of the jersey",
         year="2021 — 2023", role="Account Director → Senior Account Director, Realm Agency", disciplines=["Jersey sponsorship", "Campaign development", "Partner relations", "Experiential"],
         hero_clip="/assets/clips/flex-falcon.mp4", hero_img="/assets/clips/flex-falcon.jpg", hero_vimeo="781610331",
         lead="FLEX Power Tools on the front of Los Angeles FC’s jersey, and a campaign big enough to match.",
         body=["Taylor worked across FLEX’s LAFC front-of-jersey sponsorship, from campaign development and partner relations to experiential activations.",
               "The program reached more than 60 billion impressions."],
         figures=[("60B+", "Impressions")], film=dict(vimeo="781610331", title="FLEX × LAFC"),
         gallery=["/assets/img/flex-lafc-welcome.jpg", "/assets/clips/flex-soccer.jpg"]),
    dict(slug="superfile-ufc-wwe", client="SuperFile × UFC & WWE", title="Fight night, worldwide",
         year="2026", role="VP of Brand, SuperFile", disciplines=["Global partnership", "Live events", "Brand integration"],
         hero_img="/assets/img/ufc-wwe.jpg",
         lead="A global partnership with TKO that made SuperFile the first Official Secure File Sharing Partner of both UFC and WWE.",
         body=["Taylor developed and managed the partnership across sponsorship rights, partner assets, brand integration and activation, taking SuperFile into the Octagon and the WWE ring for fight nights and live events."],
         figures=[], link=("Partnership announcement", "https://www.ufc.com/news/tko-and-superfile-announce-global-partnership-across-ufc-and-wwe"),
         gallery=[]),
    dict(slug="ego", client="EGO Power+", title="Out of the plane",
         year="2024 — 2025", role="Managing Director / Partner, Realm Agency", disciplines=["Product launches", "Live action", "VFX", "Post-production"],
         hero_clip="/assets/clips/ego.mp4", hero_img="/assets/clips/ego.jpg",
         lead="Launch creative for EGO’s outdoor power equipment, shot in the air and on the ground.",
         body=["At Realm Agency, Taylor oversaw the delivery of more than 20,000 creative and campaign assets for EGO, SKIL and FLEX, supporting over 200 product launches and integrated marketing initiatives, and executive produced campaigns across live action, VFX, animation and post-production."],
         figures=[("20,000+", "Assets delivered for EGO, SKIL & FLEX"), ("200+", "Product launches supported")],
         film=dict(video="/assets/video/reel.mp4#t=4.4", title="EGO"), gallery=[]),
    dict(slug="superfile-trackhouse-motogp", client="SuperFile Trackhouse MotoGP Team", title="Name on the grid",
         year="2026", role="VP of Brand, SuperFile", disciplines=["Title partnership", "Content", "Hospitality"],
         hero_img="/assets/img/motogp-superfile.jpg",
         lead="From logos on the fairing to the name on the team: SuperFile’s title partnership with Trackhouse in MotoGP.",
         body=["Building on the NASCAR program, SuperFile became title partner of the Trackhouse MotoGP team. Taylor ran the partnership across rights, assets, paddock content and hospitality at each round."],
         figures=[], film=dict(yt="JF26n2-jgBI", title="SuperFile Trackhouse MotoGP Team"), gallery=[]),
    dict(slug="skil", client="SKIL", title="Don’t be a gas zombie",
         year="Realm Agency", role="Realm Agency", disciplines=["Campaign", "Talent", "Production", "VFX"],
         hero_clip="/assets/clips/skil.mp4", hero_img="/assets/clips/skil.jpg",
         lead="A cordless-power campaign for SKIL, played for laughs, with talent, production and visual effects.",
         body=["Part of Realm Agency’s work across Chervon’s brands, where Taylor led integrated campaigns from concept through delivery, coordinating creative teams, production, post-production and external partners."],
         figures=[], film=dict(yt="8U5-WrfmTlE", title="SKIL — Don’t Be a Gas Zombie"), gallery=[]),
    dict(slug="superfile-art-car", client="SuperFile × Mr. Brainwash", title="The art car",
         year="2026", role="VP of Brand, SuperFile", disciplines=["Art car", "Culture", "NASCAR"],
         hero_img="/assets/img/art-car.jpg", hero_light=True,
         lead="The #97 handed to the street artist Mr. Brainwash for Las Vegas, turning a race weekend into a culture moment.",
         body=["A one-off livery inside SuperFile’s Trackhouse Racing program, bringing art into a sport built on speed."],
         figures=[], link=("Livery coverage", "https://www.jayski.com/2026/03/10/shane-van-gisbergen-running-unique-superfile-livery-at-las-vegas-sponsoring-connor-zilisch-at-new-hampshire/"),
         gallery=[]),
    dict(slug="superfile-brand-launch", client="SuperFile", title="Brand launch",
         year="2025 — 2026", role="VP of Brand, SuperFile", disciplines=["Brand development", "Integrated marketing", "Content", "Social"],
         hero_img="/assets/img/vm-1014838410.jpg", hero_vimeo="1014838410",
         lead="Taking a new brand to market across brand, creative, content, production and partnerships.",
         body=["Taylor launched SuperFile’s brand, building and leading a 25+ person department across brand, strategy, creative, partnerships and production, and aligning marketing, product and sales on go-to-market.",
               "On social, Taylor launched and scaled SuperFile’s Instagram to more than 150,000 followers in eight months, averaging 18,000+ new followers a month."],
         figures=[("$20M+", "Production budgets managed"), ("150K+", "Instagram followers in 8 months"), ("25+", "Person department built")],
         film=dict(vimeo="1014838410", title="SuperFile"), gallery=[]),
]

e = html.escape

def film_attrs(f):
    if "yt" in f: return f'data-yt="{e(f["yt"])}"'
    if "vimeo" in f: return f'data-vimeo="{e(f["vimeo"])}"'
    return f'data-video="{e(f["video"])}"'

def page(p, nxt):
    hero = (f'<video class="case-hero-media" autoplay muted loop playsinline poster="{p["hero_img"]}" aria-hidden="true"><source src="{p["hero_clip"]}" type="video/mp4"></video>'
            if p.get("hero_clip") else
            f'<img class="case-hero-media{" light" if p.get("hero_light") else ""}" src="{p["hero_img"]}" alt="{e(p["client"])}">')
    if p.get("hero_vimeo"):
        hero += (f'<iframe class="case-hero-vimeo" data-hd src="https://player.vimeo.com/video/{p["hero_vimeo"]}?background=1&autoplay=1&loop=1&muted=1&dnt=1" '
                 f'allow="autoplay; fullscreen; picture-in-picture" title="{e(p["client"])}" aria-hidden="true" tabindex="-1"></iframe>')
    actions = []
    if p.get("film"):
        actions.append(f'<button type="button" class="chip-btn solid" {film_attrs(p["film"])} data-title="{e(p["film"]["title"])}">Watch the film</button>')
    if p.get("link"):
        actions.append(f'<a class="chip-btn" href="{e(p["link"][1])}" target="_blank" rel="noopener">{e(p["link"][0])} ↗</a>')
    figures = "".join(f'<div><dt>{e(a)}</dt><dd>{e(b)}</dd></div>' for a, b in p["figures"])
    gallery = "".join(f'<figure class="{"light" if "art-car" in g else ""}"><img src="{g}" alt="" loading="lazy"></figure>' for g in p["gallery"]) if len(p["gallery"]) >= 2 else ""
    body = "".join(f"<p>{e(t)}</p>" for t in p["body"])
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(p["client"])} — {e(p["title"])} · Taylor Powers</title>
<meta name="description" content="{e(p["lead"])}">
<meta property="og:title" content="{e(p["client"])} — {e(p["title"])}">
<meta property="og:description" content="{e(p["lead"])}">
<meta property="og:image" content="https://taylorpowers.com{p["hero_img"]}">
<meta property="og:url" content="https://taylorpowers.com/work/{p["slug"]}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0a0a0a">
<link rel="icon" href="/assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap">
<link rel="stylesheet" href="/assets/site.css?v={V}">
</head>
<body class="case-page">
<header class="bar solid" id="bar">
  <a class="mark" href="/">Taylor Powers</a>
  <nav aria-label="Main"><a href="/#work">Work</a><a href="/#about">About</a><a href="/#contact">Contact</a></nav>
</header>
<main>
  <section class="case-hero{" light-hero" if p.get("hero_light") else ""}">
    {hero}
    <div class="case-hero-shade" aria-hidden="true"></div>
    <div class="case-hero-copy">
      <p class="kick accent">{e(p["client"])}</p>
      <h1 class="display">{e(p["title"])}</h1>
    </div>
  </section>
  <section class="case-body">
    <dl class="case-meta">
      <div><dt>Client</dt><dd>{e(p["client"])}</dd></div>
      <div><dt>Year</dt><dd>{e(p["year"])}</dd></div>
      <div><dt>Role</dt><dd>{e(p["role"])}</dd></div>
      <div><dt>Disciplines</dt><dd>{e(" · ".join(p["disciplines"]))}</dd></div>
    </dl>
    <div class="case-text">
      <p class="lead">{e(p["lead"])}</p>
      {body}
      {f'<div class="case-actions">{"".join(actions)}</div>' if actions else ""}
    </div>
    {f'<dl class="figures case-figures">{figures}</dl>' if figures else ""}
    {f'<div class="case-gallery">{gallery}</div>' if gallery else ""}
  </section>
  <a class="next" href="/work/{nxt["slug"]}/">
    <span class="kick">Next project</span>
    <span class="display">{e(nxt["client"])}</span>
    <span class="next-sub">{e(nxt["title"])} →</span>
  </a>
</main>
<footer class="case-foot"><a href="/#work">← All work</a><a href="mailto:taylor@taylorpowers.com">taylor@taylorpowers.com</a></footer>
<dialog class="player" id="player" aria-label="Video">
  <div class="frame" id="playerFrame"></div>
  <div class="player-bar"><span id="playerTitle"></span><button type="button" id="playerClose">Close ✕</button></div>
</dialog>
<script src="/assets/site.js?v={V}" defer></script>
</body>
</html>
'''

for i, p in enumerate(PROJECTS):
    out = ROOT / "work" / p["slug"] / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page(p, PROJECTS[(i + 1) % len(PROJECTS)]))
    print("wrote", out.relative_to(ROOT))
