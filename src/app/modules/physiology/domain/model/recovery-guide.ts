import { SimulatedRecovery } from './recovery-simulation';

/**
 * Rule-based recovery guide used until the backend assistant (Gemini) is available.
 * It answers from the user's own records, explains the product, refuses medical advice
 * and declines any question outside sleep, training, recovery and wellbeing.
 */
export type GuideTopic =
  | 'medical'
  | 'alerts'
  | 'plans'
  | 'training'
  | 'sleep'
  | 'stress'
  | 'recovery'
  | 'product'
  | 'greeting'
  | 'outOfScope';
export interface GuideSentence {
  readonly key: string;
  readonly values?: Readonly<Record<string, string | number>>;
}
export interface GuideFacts {
  readonly rows: readonly SimulatedRecovery[];
  readonly targetHours: number;
  readonly alerts: readonly { readonly title: string }[];
}
const TOPICS: readonly [GuideTopic, RegExp][] = [
  [
    'medical',
    /\b(pastilla|medic|farmac|pill|drug|diagnos|enfermedad|disease|sintoma|symptom|dolor|pain|lesion|injur|doctor)/,
  ],
  ['alerts', /\b(alerta|alert|aviso|warning)/],
  [
    'plans',
    /\b(precio|price|cost|cuesta|cuanto vale|suscrip|subscri|pagar|pago|payment|tarifa|planes|basic\b|pro\b)/,
  ],
  [
    'product',
    /\b(como (registro|uso|agrego|anoto|conecto|exporto|descargo|cambio)|how (do|can) i|donde (registro|veo|esta)|where (do|can|is))/,
  ],
  [
    'training',
    /\b(entren|train|workout|ejercici|exercis|esfuerzo|effort|correr|run|gym|gimnasio|intens|sesion|session|deport|sport|pesas|cardio)/,
  ],
  ['sleep', /\b(dorm|sueno|sleep|noche|night|insomn|acost|despert|siesta|nap|bedtime|slept)/],
  [
    'stress',
    /\b(estres|stress|animo|mood|ansied|anxi|bienestar|wellness|wellbeing|relaj|respira|breath|calma|calm)/,
  ],
  [
    'recovery',
    /\b(recupera|recover|descans|rest\b|listo|ready|readiness|hrv|variabilidad|frecuencia|heart rate|pulso|como estoy|how am i|como voy|resumen|summary|should i|deberia|semana|week|hoy|today)/,
  ],
  [
    'product',
    /\b(pulsepower|plataforma|platform|aplicacion|app\b|registr|log\b|reporte|report|pdf|simulad|simulat|dispositivo|device|pulsera|wearable|reloj|watch|perfil|profile|cuenta\b|account|ayuda|help|que puedes|what can you)/,
  ],
  ['greeting', /^(hola|hi|hello|hey|buenas|buenos dias|good (morning|afternoon|evening))\b/],
];
export function classifyQuestion(question: string): GuideTopic {
  const text = question.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  return TOPICS.find(([, pattern]) => pattern.test(text))?.[0] ?? 'outOfScope';
}
const round = (value: number) => Math.round(value * 10) / 10;
const mean = (values: readonly number[]) =>
  values.length ? round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
function guidance(level: number): GuideSentence {
  return {
    key:
      level < 40
        ? 'simulator.guidance.rest'
        : level < 70
          ? 'simulator.guidance.reduce'
          : 'simulator.guidance.follow',
  };
}
function sleepAnswer(facts: GuideFacts, week: readonly SimulatedRecovery[]): GuideSentence[] {
  const nights = week.flatMap((row) => (row.sleepHours === null ? [] : [row.sleepHours]));
  if (!nights.length) return [{ key: 'guide.sleep.none' }];
  const below = nights.filter((hours) => hours < facts.targetHours).length;
  const last = week.at(-1)?.sleepHours ?? null;
  return [
    { key: 'guide.sleep.summary', values: { average: mean(nights)!, target: facts.targetHours } },
    { key: 'guide.sleep.below', values: { below, nights: nights.length } },
    ...(last === null ? [] : [{ key: 'guide.sleep.last', values: { hours: round(last) } }]),
    { key: below * 2 > nights.length ? 'guide.sleep.adviceLow' : 'guide.sleep.adviceOk' },
  ];
}
function todayAnswer(today: SimulatedRecovery | undefined): GuideSentence[] {
  if (!today || today.score === null) return [{ key: 'guide.recovery.missing' }];
  return [
    {
      key: 'guide.recovery.today',
      values: {
        level: today.score,
        sleep: round(today.sleepHours ?? 0),
        stress: today.stress === null ? '—' : round(today.stress),
        effort: today.effort === null ? '—' : round(today.effort),
      },
    },
    guidance(today.score),
  ];
}
function trainingAnswer(week: readonly SimulatedRecovery[]): GuideSentence[] {
  const efforts = week.flatMap((row) => (row.effort === null ? [] : [row.effort]));
  const today = week.at(-1);
  return [
    ...todayAnswer(today),
    efforts.length
      ? { key: 'guide.training.week', values: { days: efforts.length, effort: mean(efforts)! } }
      : { key: 'guide.training.none' },
    ...(today?.score === null || today?.score === undefined
      ? []
      : [
          {
            key:
              today.score < 40
                ? 'guide.training.rest'
                : today.score < 70
                  ? 'guide.training.reduce'
                  : 'guide.training.follow',
          },
        ]),
  ];
}
function stressAnswer(week: readonly SimulatedRecovery[]): GuideSentence[] {
  const values = week.flatMap((row) => (row.stress === null ? [] : [row.stress]));
  if (!values.length) return [{ key: 'guide.stress.none' }];
  const today = week.at(-1)?.stress ?? null;
  const average = mean(values)!;
  return [
    today === null
      ? { key: 'guide.stress.week', values: { average } }
      : { key: 'guide.stress.summary', values: { average, today } },
    {
      key: Math.max(average, today ?? 0) >= 7 ? 'guide.stress.adviceHigh' : 'guide.stress.adviceOk',
    },
  ];
}
export function guideAnswer(topic: GuideTopic, facts: GuideFacts): GuideSentence[] {
  const week = facts.rows.slice(-7);
  const hasData = week.some(
    (row) => row.sleepHours !== null || row.effort !== null || row.stress !== null,
  );
  const needsData = ['training', 'sleep', 'stress', 'recovery'].includes(topic);
  if (needsData && !hasData) return [{ key: 'guide.noData' }];
  switch (topic) {
    case 'medical':
      return [{ key: 'guide.medical' }];
    case 'alerts':
      return facts.alerts.length
        ? [
            {
              key: 'guide.alerts.list',
              values: { count: facts.alerts.length, latest: facts.alerts[0]!.title },
            },
          ]
        : [{ key: 'guide.alerts.none' }];
    case 'plans':
      return [{ key: 'guide.plans' }];
    case 'training':
      return [...trainingAnswer(week), { key: 'guide.disclaimer' }];
    case 'sleep':
      return sleepAnswer(facts, week);
    case 'stress':
      return stressAnswer(week);
    case 'recovery': {
      const scores = week.flatMap((row) => (row.score === null ? [] : [row.score]));
      return [
        ...todayAnswer(week.at(-1)),
        ...(scores.length
          ? [{ key: 'guide.recovery.week', values: { average: mean(scores)! } }]
          : []),
        { key: 'guide.disclaimer' },
      ];
    }
    case 'product':
      return [{ key: 'guide.product' }];
    case 'greeting':
      return [{ key: 'guide.greeting' }];
    case 'outOfScope':
      return [{ key: 'guide.outOfScope' }];
  }
}
