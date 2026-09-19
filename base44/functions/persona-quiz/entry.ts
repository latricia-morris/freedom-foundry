import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { questions, scoreQuizAnswers } from './definition.ts';
import { sendQuizResultEmail } from '../../shared/email/service.ts';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const expirationMs = 1000 * 60 * 60 * 24 * 7;
const BRAND_VIEWS = ['personal', 'corporate', 'one_and_the_same'];

function parseAnswers(value) {
  if (!Array.isArray(value) || value.length !== questions.length ||
      value.some((answer) => !Number.isInteger(answer) || answer < 0 || answer >= 6)) return null;
  return value;
}

function result(record) {
  if (!record) return null;
  return {
    id: record.id,
    brandView: record.brand_view,
    primaryArchetype: record.primary_archetype,
    primaryScore: record.primary_score,
    secondaryArchetype: record.secondary_archetype,
    secondaryScore: record.secondary_score,
    scores: record.scores,
    createdAt: record.created_date,
  };
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (action === 'definition') {
      // Read-only question texts; scoring weights stay server-side.
      return Response.json({
        questions: questions.map(({ id, text, answers }) => ({
          id,
          text,
          answers: answers.map(({ text: answerText }) => ({ text: answerText })),
        })),
      });
    }

    if (action === 'submit') {
      const payload = body.payload && typeof body.payload === 'object' ? body.payload : {};
      const answers = parseAnswers(payload.answers);
      const firstName = typeof payload.firstName === 'string' ? payload.firstName.trim() : '';
      let email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
      const brandView = BRAND_VIEWS.includes(payload.brandView) ? payload.brandView : 'personal';
      if (!answers || firstName.length < 1 || firstName.length > 100 || !emailPattern.test(email) || email.length > 320) {
        return Response.json({ error: 'Exactly 18 valid answers, a first name, and a valid email are required' }, { status: 400 });
      }
      if (payload.marketingConsent !== true) {
        return Response.json({ error: 'Marketing consent is required to receive the Brand Persona report and selected insights.' }, { status: 400 });
      }

      const scored = scoreQuizAnswers(answers);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expirationMs).toISOString();

      if (user) {
        // Signed-in member: the platform account email is the verified identity.
        email = (user.email || email).toLowerCase();
        const record = await base44.entities.PersonaQuizAttempt.create({
          first_name: firstName,
          email,
          marketing_consent: true,
          brand_view: brandView,
          answers,
          scores: scored.scores,
          primary_archetype: scored.primary,
          primary_score: scored.primaryScore,
          secondary_archetype: scored.secondary,
          secondary_score: scored.secondaryScore,
          status: 'claimed',
          user_id: user.id,
          expires_at: expiresAt,
          claimed_at: now.toISOString(),
        });
        // App-native transactional confirmation through Resend. The
        // archetype-based nurture drip lives in GoHighLevel (CRM), kept
        // deliberately separate from this transactional layer.
        const quizEmail = await sendQuizResultEmail(base44.asServiceRole, {
          to: email,
          firstName,
          primaryArchetype: scored.primary,
          secondaryArchetype: scored.secondary,
          relatedId: record.id,
          userId: user.id,
        });
        if (!quizEmail.ok) console.error('quiz result email failed:', quizEmail.error);
        return Response.json({ result: result(record), emailed: quizEmail.ok });
      }

      // Anonymous lead capture (strictly validated, marketing consent required):
      // stored via the service role with a claim token, like the Replit server did.
      const token = randomToken();
      const tokenHash = await sha256Hex(token);
      const record = await base44.asServiceRole.entities.PersonaQuizAttempt.create({
        first_name: firstName,
        email,
        marketing_consent: true,
        brand_view: brandView,
        answers,
        scores: scored.scores,
        primary_archetype: scored.primary,
        primary_score: scored.primaryScore,
        secondary_archetype: scored.secondary,
        secondary_score: scored.secondaryScore,
        status: 'pending',
        token_hash: tokenHash,
        expires_at: expiresAt,
      });
      // Same Resend confirmation for anonymous quiz leads; GHL owns the drip.
      const quizEmail = await sendQuizResultEmail(base44.asServiceRole, {
        to: email,
        firstName,
        primaryArchetype: scored.primary,
        secondaryArchetype: scored.secondary,
        relatedId: record.id,
      });
      if (!quizEmail.ok) console.error('quiz result email failed:', quizEmail.error);
      return Response.json({ token, expiresAt: record.expires_at, emailed: quizEmail.ok });
    }

    if (action === 'claim') {
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const token = body.payload && typeof body.payload.token === 'string' ? body.payload.token : '';
      if (!token) return Response.json({ error: 'A valid claim token is required' }, { status: 400 });
      const tokenHash = await sha256Hex(token);
      // Anonymous-created attempts are not readable under RLS, so resolve them
      // server-side; the claim itself re-checks the account email.
      const rows = await base44.asServiceRole.entities.PersonaQuizAttempt.filter({ token_hash: tokenHash, status: 'pending' });
      const row = rows && rows[0];
      if (!row) return Response.json({ error: 'Attempt not found or already claimed' }, { status: 404 });
      if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
        return Response.json({ error: 'Attempt not found or already claimed' }, { status: 404 });
      }
      if ((row.email || '').toLowerCase() !== (user.email || '').toLowerCase()) {
        return Response.json({ error: 'Attempt email does not match authenticated account' }, { status: 403 });
      }
      const updated = await base44.asServiceRole.entities.PersonaQuizAttempt.update(row.id, {
        status: 'claimed',
        user_id: user.id,
        claimed_at: new Date().toISOString(),
      });
      return Response.json({ result: result(updated) });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('persona-quiz error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}