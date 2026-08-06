export interface VercelDeployResult {
  url: string;
  deploymentId: string;
  readyState: string;
}

/**
 * Deploys a single static HTML page directly to Vercel using the person's
 * own personal access token (vercel.com/account/tokens). Calls the real
 * REST API from the browser - no backend, consistent with how every other
 * provider key in this app works.
 *
 * Known limitation: Vercel's API is not documented as explicitly supporting
 * arbitrary cross-origin browser requests. If the browser blocks this with
 * a CORS error, that will surface clearly in the thrown error rather than
 * failing silently - there is no server-side fallback in this app by design.
 */
export async function deployToVercel(
  html: string,
  projectName: string,
  token: string,
  target: 'preview' | 'production' = 'preview'
): Promise<VercelDeployResult> {
  if (!token.trim()) {
    throw new Error('No Vercel token configured. Add one in Settings first (vercel.com/account/tokens).');
  }

  const safeName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'gia-co-design-export';

  let response: Response;
  try {
    response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: safeName,
        target,
        files: [{ file: 'index.html', data: html }],
        projectSettings: { framework: null },
      }),
    });
  } catch (networkErr) {
    // A TypeError here from fetch() with no response at all is the
    // classic signature of a CORS rejection or being fully offline.
    throw new Error(
      'Could not reach the Vercel API from the browser. This may be a CORS restriction on api.vercel.com rather than a token problem - if it persists, deploying via the Vercel CLI/dashboard is the reliable fallback.'
    );
  }

  if (!response.ok) {
    let detail = '';
    try {
      const errJson = await response.json();
      detail = errJson?.error?.message || JSON.stringify(errJson);
    } catch {
      detail = await response.text().catch(() => '');
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error('Vercel rejected the token. Check it is a valid, non-expired personal access token.');
    }
    throw new Error(`Vercel deployment failed (${response.status}): ${detail || 'Unknown error'}`);
  }

  const data = await response.json();
  const deployUrl: string = data.url ? `https://${data.url}` : '';
  if (!deployUrl) {
    throw new Error('Vercel returned a deployment with no URL. Check the Vercel dashboard directly.');
  }

  return {
    url: deployUrl,
    deploymentId: data.id || data.uid || '',
    readyState: data.readyState || 'QUEUED',
  };
}
