const dns = require('dns');

function applyDnsOverride() {
  // In environments where the local/ISP/VPN DNS server does not support
  // or blocks resolving MongoDB Atlas SRV/TXT records, we override the default DNS servers
  // to use Google's public DNS (8.8.8.8) and Cloudflare's public DNS (1.1.1.1).
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('[DNS Override] Configured Node.js DNS resolver to use 8.8.8.8 and 1.1.1.1');
    return true;
  } catch (error) {
    console.warn('[DNS Override] Failed to set custom DNS servers:', error.message);
    return false;
  }
}

module.exports = { applyDnsOverride };
