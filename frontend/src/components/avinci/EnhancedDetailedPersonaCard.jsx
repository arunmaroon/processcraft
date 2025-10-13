import React from 'react';
import {
  MapPinIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

const Section = ({ title, children }) => (
  <section className="space-y-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
    {children}
  </section>
);

const List = ({ items, emptyLabel = 'Not available' }) => {
  const content = toArray(items);
  if (content.length === 0) return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  return (
    <ul className="space-y-2 text-sm text-slate-700">
      {content.map((item, index) => (
        <li key={`${item}-${index}`} className="leading-relaxed">{item}</li>
      ))}
    </ul>
  );
};

const BadgeList = ({ items, emptyLabel = 'Not specified' }) => {
  const content = toArray(items);
  if (content.length === 0) return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {content.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const KeyValueList = ({ data = {}, emptyLabel = 'Not specified' }) => {
  if (!data || typeof data !== 'object') {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }
  const entries = Object.entries(data).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && `${value}`.trim() !== '';
  });
  if (entries.length === 0) return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  return (
    <dl className="space-y-3 text-sm">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt className="font-semibold text-slate-800 capitalize">{key.replace(/_/g, ' ')}</dt>
          <dd className="mt-1 text-slate-600">
            {Array.isArray(value) ? value.join(', ') : value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const Field = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
        <Icon className="h-5 w-5 text-slate-600" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

const EnhancedDetailedPersonaCard = ({ persona }) => {
  if (!persona) return null;

  const {
    name,
    title,
    occupation,
    location,
    demographics = {},
    age,
    gender,
    avatar_url,
    avatar,
    quote,
    background,
    goals,
    motivations,
    goals_detail,
    pain_points,
    pain_points_detail,
    ui_pain_points,
    behaviors,
    daily_routine,
    daily_life: rawDailyLife,
    decision_making,
    technology,
    fintech_preferences,
    personality_profile,
    personality = {},
    hobbies,
    emotional_profile_extended,
    social_context,
    cultural_background,
    life_events,
    voice,
    insights,
  } = persona;

  const photo = getAvatarSrc(avatar_url || avatar, name, { size: 240 });
  const primaryGoals = goals_detail?.primary || goals;
  const secondaryGoals = goals_detail?.secondary || [];
  const generalPainPoints = pain_points_detail?.primary || pain_points;
  const frustrations = pain_points_detail?.frustrations;

  const traits = personality_profile || personality.traits;
  const values = personality.values;

  const triggers = emotional_profile_extended?.triggers;
  const responses = emotional_profile_extended?.responses;

  const devices = technology?.devices || technology?.preferred_devices;
  const apps = technology?.apps || technology?.software;

  return (
    <article className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 shadow-xl">
      <div className="flex flex-col gap-6 rounded-t-3xl bg-white px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm lg:mx-0">
            <img
              src={photo}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => handleAvatarError(e, name, { size: 240 })}
            />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{name || 'Unnamed Persona'}</h1>
              <p className="text-sm font-medium text-indigo-600">
                {title || occupation || 'Role not specified'}
              </p>
              <p className="text-sm text-slate-500">
                {location || demographics.location || 'Location not provided'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field icon={CalendarIcon} label="Age" value={age || demographics.age} />
              <Field icon={UserGroupIcon} label="Gender" value={gender || demographics.gender} />
              <Field icon={AcademicCapIcon} label="Education" value={demographics.education} />
              <Field icon={MapPinIcon} label="Persona Type" value={demographics.persona_type} />
            </div>
          </div>
        </div>
        {quote && (
          <blockquote className="rounded-2xl border border-slate-200 bg-slate-100/70 px-5 py-4 text-sm italic text-slate-700">
            “{quote}”
          </blockquote>
        )}
      </div>

      <div className="space-y-6 border-t border-slate-200 bg-slate-50 px-4 py-8 sm:px-6">
        <Section title="Life Story">
          <p className="text-sm leading-6 text-slate-700">
            {background || 'No background information available yet.'}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Personality Traits</p>
              <BadgeList items={traits} emptyLabel="Traits not documented." />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Values</p>
              <BadgeList items={values} emptyLabel="Values not recorded." />
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hobbies & Interests</p>
              <BadgeList items={hobbies} emptyLabel="Hobbies not captured." />
            </div>
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Goals & Motivations">
            <div className="grid gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary Goals</p>
                <List items={primaryGoals} emptyLabel="No primary goals provided." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secondary Goals</p>
                <List items={secondaryGoals} emptyLabel="No secondary goals provided." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Motivations</p>
                <List items={motivations} emptyLabel="Motivations not captured." />
              </div>
            </div>
          </Section>

          <Section title="Pain Points">
            <div className="grid gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">General Frustrations</p>
                <List items={generalPainPoints} emptyLabel="No pain points recorded." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">UX-Specific Issues</p>
                <List items={ui_pain_points} emptyLabel="No UX issues noted." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recurring Concerns</p>
                <List items={frustrations} emptyLabel="No recurring concerns captured." />
              </div>
            </div>
          </Section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Daily Rhythm">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Habits & Behaviors</p>
                <List items={behaviors?.habits} emptyLabel="Habits not documented." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Daily Routine</p>
                <List items={daily_routine || rawDailyLife?.schedule} emptyLabel="Routine not captured." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Decision Style</p>
                <p className="text-sm text-slate-700">{decision_making?.style || 'Not specified.'}</p>
                <BadgeList items={decision_making?.influences} emptyLabel="Influences not noted." />
              </div>
            </div>
          </Section>

          <Section title="Tools & Preferences">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Devices</p>
                <BadgeList items={devices} emptyLabel="Devices not captured." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Apps & Platforms</p>
                <BadgeList items={apps} emptyLabel="Apps not captured." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fintech Behaviour</p>
                <KeyValueList data={fintech_preferences} emptyLabel="Fintech usage not captured." />
              </div>
            </div>
          </Section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Emotional Landscape">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Triggers</p>
                <List items={triggers} emptyLabel="Triggers not documented." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Responses</p>
                <List items={responses} emptyLabel="Responses not documented." />
              </div>
            </div>
          </Section>

          <Section title="Social & Cultural Context">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Family</p>
                <p className="text-sm text-slate-700">{social_context?.family || 'Not specified.'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Friends</p>
                <p className="text-sm text-slate-700">{social_context?.friends || 'Not specified.'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Community Values</p>
                <BadgeList items={social_context?.community_values} emptyLabel="Community values not captured." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cultural Heritage</p>
                <p className="text-sm text-slate-700">{cultural_background?.heritage || 'Not documented.'}</p>
                <BadgeList items={cultural_background?.beliefs} emptyLabel="Beliefs not captured." />
              </div>
            </div>
          </Section>
        </div>

        <Section title="Life Events">
          {Array.isArray(life_events) && life_events.length > 0 ? (
            <ul className="space-y-3">
              {life_events.map((event, index) => (
                <li
                  key={`${event.event || 'life-event'}-${index}`}
                  className="rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm"
                >
                  <div className="font-semibold text-orange-900">{event.event || 'Milestone'}</div>
                  <div className="text-xs uppercase tracking-wide text-orange-700">
                    {event.year || 'Year not specified'}
                  </div>
                  <p className="mt-1 text-orange-900/80">{event.impact || 'Impact unknown.'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No life events recorded.</p>
          )}
        </Section>

        <Section title="Voice & Tone">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Communication Style</p>
              <p className="text-sm text-slate-700">
                {voice?.style || voice?.tone || 'Preferred communication style not provided.'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Key Phrases</p>
              <List items={voice?.key_phrases} emptyLabel="Key phrases not documented." />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommendations</p>
              <List items={insights?.recommendations} emptyLabel="Recommendations not available." />
            </div>
          </div>
        </Section>
      </div>
    </article>
  );
};

export default EnhancedDetailedPersonaCard;
