import { authCapability } from '../../../auth';
import { adminCapability } from '../../../lib/access';
import { databaseConfigured } from '../../../lib/db';
import { trebloConfigured } from '../../../lib/providers/treblo';
import { googleDriveConfigured } from '../../../lib/storage/googleDrive';
import { getWiPayConfig, wiPayReadyForLive } from '../../lib/payments/wipay';

export const dynamic = 'force-dynamic';

export async function GET() {
  const wipay = getWiPayConfig();
  const auth = authCapability();
  const admin = adminCapability();

  return Response.json({
    ok: true,
    service: 'reggaeai',
    version: '0.1.0',
    status: 'foundation-live',
    deployment: {
      environment: process.env.RAILWAY_ENVIRONMENT_NAME || null,
      service: process.env.RAILWAY_SERVICE_NAME || null,
      publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || null
    },
    capabilities: {
      publicCatalogue: 'READY',
      search: 'READY',
      smartImportDiscovery: 'READY',
      database: databaseConfigured() ? 'READY' : 'TO_CREATE',
      auth: auth.state,
      founderAdmin: admin.state,
      musicGeneration: trebloConfigured() ? 'READY' : 'TO_CREATE',
      controlledStorage: googleDriveConfigured() ? 'READY_GOOGLE_DRIVE' : 'OAUTH_REQUIRED',
      imageGeneration: 'TO_VERIFY',
      videoGeneration: 'TO_VERIFY',
      payments: wipay.environment === 'live' ? (wiPayReadyForLive(wipay) ? 'READY' : 'BLOCKED') : 'SANDBOX',
      creatorPayoutRail: 'TO_CREATE'
    }
  });
}
