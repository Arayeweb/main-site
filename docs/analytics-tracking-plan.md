# Araaye Analytics Tracking Plan

Last updated: 2026-07-24  
Schema version: 1  
Destinations: first-party Supabase `analytics_events`, GTM/GA4, PostHog

## Decisions this data must support

1. Which acquisition channels and landing pages create qualified leads and revenue?
2. Where does each product funnel lose the most users?
3. Which product actions correlate with activation, retention, and purchase?
4. Which features, content, and free tools deserve more investment?
5. Which experiment should be run next, and did it improve the target KPI without hurting a guardrail?

## Identity and attribution

| Field | Scope | Definition |
|---|---|---|
| `event_id` | Event | UUID used for deduplication |
| `visitor_id` | Browser | Anonymous first-party UUID in local storage |
| `session_id` | Session | Anonymous UUID in session storage |
| `product_area` | Event | Product inferred from the route |
| `canonical_event_name` | Event | Stable cross-product name used in KPI queries |
| `event` | Event | Original event name retained for backward compatibility |
| session UTM fields | Session | Campaign that started the current browser session |
| `first_utm_*` | Visitor | First known campaign for this browser |
| `last_utm_*` | Visitor | Most recent known campaign for this browser |
| `event_origin` | Event | `client` for interaction events, `server` for verified business events |
| `dedupe_key` | Server event | Stable unique key preventing repeated payment callbacks from double counting |

Do not send names, phone numbers, email addresses, form values, prompts, passwords, tokens, or free-text messages to analytics.

## Canonical event taxonomy

| Canonical event | Trigger | Required properties | Decision |
|---|---|---|---|
| `page_view` | Every non-admin route view | page, product_area | Reach and funnel entry |
| `session_started` | First tracked event in a browser session | session_id | Sessions and frequency |
| `scroll_depth` | 25/50/75/100% | depth | Content engagement |
| `internal_link_clicked` | Internal navigation link | link_path, location | Journey analysis |
| `outbound_link_clicked` | External navigation | link_domain, location | Exit intent |
| `cta_clicked` | Product-specific CTA helpers | location, element_text | CTA effectiveness |
| `form_started` | First focus inside each form | form_name, location | Form entry |
| `form_submit_attempted` | Submit attempt | form_name, location | Validation friction |
| `lead_submitted` | Confirmed lead API success | source, product_area | Marketing conversion |
| `signup_started` | Signup begins | method/source where known | Signup funnel |
| `signup_completed` | Account created | method | Acquisition conversion |
| `checkout_started` | Checkout successfully begins | package, value, currency | Monetization intent |
| `purchase_completed` | Server-confirmed payment | transaction_id, value, currency | Revenue |
| `feature_used` | Meaningful product action | feature_name, feature_category | Discovery and adoption |
| `first_key_action_completed` | Product-specific aha moment | action_type | Activation |
| `client_error` | Browser error/rejection | error_type | Reliability guardrail |
| `page_left` | Route exit/unmount | engagement_time_seconds | Engaged time |

Existing names such as `generate_lead`, `begin_checkout`, `purchase`, and product-prefixed form/CTA events are mapped to canonical names without changing the original GTM event.

## Product areas and activation

| Product area | Routes | Activation definition |
|---|---|---|
| AI | `/ai/*` | First successful message or first generated asset |
| Growth Hub | `/app/*` | Workspace member completes first service action |
| FastWeb | `/fastweb/*`, `/s/*` | Paid site is published |
| AdReady | `/adready/*`, `/campaign/*` | Campaign is published or receives first lead |
| Website Design | `/website*` | Qualified brief or lead submitted |
| SEO | `/seo*`, `/free-seo-audit` | Audit completed or qualified lead submitted |
| Healthcare | `/doctors*`, `/clinic*`, `/demo*` | Audit/lead completed |
| Local SEO | `/googlesabt*`, `/local-seo-check` | Checkout or qualified lead completed |
| Free Tools | `/bizcard`, `/qr`, `/shortener`, `/review-link` | Tool output completed |
| Content | `/blog*`, `/prompts*` | CTA, prompt copy, or prompt run |

Each product owner should instrument its activation as `first_key_action_completed` in addition to any detailed product event.

## KPI framework

### North-star

`Weekly activated customers`: distinct account/user identifiers that complete the product-specific activation event in a rolling seven-day window. Until authenticated identifiers are consistently available, use `visitor_id` as a directional proxy and label it clearly.

### Funnel KPIs

| KPI | Formula | Primary cut |
|---|---|---|
| Visitor → engaged | engaged sessions / sessions | product, source, landing page |
| CTA rate | sessions with CTA / sessions | page, CTA location |
| Form start rate | form-start sessions / CTA sessions | product, form |
| Lead conversion | lead sessions / sessions | product, campaign |
| Form completion | confirmed leads / form starts | product, form |
| Signup conversion | completed signups / signup starts | product, source |
| Checkout conversion | purchases / checkouts | product, package |
| Revenue per visitor | purchase value / unique visitors | product, campaign |
| Activation rate | activated users / completed signups | product, cohort |
| Error-free sessions | 1 - sessions with error / sessions | product, release |

Revenue and lead events should be emitted from the successful server-side mutation or payment verification path. Client-side success-page events are useful for marketing platforms but must not be the financial source of truth.

The dashboard uses server-verified purchases whenever they exist for a product in the selected period and suppresses matching product-level client purchase totals. All revenue values are stored as IRR; gateway values named `amount_toman` are multiplied by 10 before analytics storage.

## UTM naming rules

- Use all five standard keys: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.
- Source, medium, and campaign are normalized to lowercase snake_case.
- Paid links require source + medium + campaign.
- Suggested mediums: `cpc`, `paid_social`, `email`, `organic`, `referral`, `affiliate`.
- Do not put names, phone numbers, emails, or other customer data in UTM values.
- Use the UTM Builder in Admin → Analytics → Campaign & UTM to avoid inconsistent links.

## Product discovery cadence

Weekly:

1. Review `analytics_data_quality_daily`; identity/property completeness should remain above 95%.
2. Compare product funnels in `analytics_funnel_daily` and select the largest controllable drop-off.
3. Segment the drop-off by route, device, source, and new/returning visitor.
4. Use PostHog paths/session replay only for the selected segment; do not browse recordings without a research question.
5. Pair quantitative evidence with 5–8 customer conversations or support cases.
6. Add one falsifiable hypothesis to `growth_experiments`, with a primary KPI and a guardrail.

## QA and release checklist

- [ ] Migration `20260747_analytics_foundation.sql` applied before the application release
- [ ] Migration `20260748_analytics_server_events.sql` applied before the application release
- [ ] Events visible in GTM Preview and GA4 DebugView
- [ ] The same action appears in PostHog and `analytics_events`
- [ ] Route changes create one canonical `page_view`
- [ ] Event, visitor, and session IDs are populated
- [ ] UTM attribution persists within a session
- [ ] Form fields and PII are absent from payloads
- [ ] Purchase is confirmed server-side and is not duplicated
- [ ] Mobile and desktop smoke tests pass
- [ ] Opt-out and browser Do Not Track prevent client collection
