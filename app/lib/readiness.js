const PASS = new Set(['ready', 'complete', 'verified', 'cleared', 'present', 'approved']);

export function evaluateReadiness(input = {}) {
  const fields = [
    ['audio', input.audio_state],
    ['artwork', input.artwork_state],
    ['metadata', input.metadata_state],
    ['rights', input.rights_state],
    ['provenance', input.provenance_state],
    ['credits', input.credits_state],
    ['catalogue', input.catalogue_state]
  ];

  const blockers = fields
    .filter(([, value]) => !PASS.has(String(value || '').toLowerCase()))
    .map(([field, value]) => ({ field, state: value || 'missing' }));

  const passed = fields.length - blockers.length;
  const score = Math.round((passed / fields.length) * 100);

  const hardBlock = blockers.some((item) => ['rights', 'provenance'].includes(item.field));
  const readiness_state = hardBlock
    ? 'blocked'
    : blockers.length
      ? 'approval_required'
      : 'verified_complete';

  return { score, blockers, readiness_state };
}
