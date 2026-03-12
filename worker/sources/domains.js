/**
 * Domain availability checker
 * Uses lightweight DNS lookup — domain is "available" if DNS resolution fails (NXDOMAIN)
 */

import dns from 'dns'
import { promisify } from 'util'

const resolve = promisify(dns.resolve)

export async function checkDomainAvailability(domains) {
  const results = {}

  for (const domain of domains) {
    try {
      await resolve(domain)
      // DNS resolved — domain is taken
      results[domain] = false
    } catch (err) {
      if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
        // DNS failed — domain is likely available
        results[domain] = true
      } else {
        // Other error — skip this domain
        console.warn(`⚠️ DNS check failed for ${domain}:`, err.code)
        results[domain] = false
      }
    }
  }

  return results
}
