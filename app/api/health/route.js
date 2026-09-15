export async function GET() {
  return Response.json({
    ok: true,
    service: 'reggaeai',
    version: '0.1.0',
    status: 'foundation-live'
  });
}
