const childProcess = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');

const normalizeContextPath = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '');
};

const contextPath = normalizeContextPath(
  process.env.WREN_UI_CONTEXT_PATH || '/',
);
const publicPort = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || '0.0.0.0';
const internalPort = Number(
  process.env.WREN_UI_INTERNAL_PORT || (publicPort === 3100 ? 3101 : 3100),
);

const standaloneServer = path.join(root, '.next', 'standalone', 'server.js');
const dockerServer = path.join(root, 'server.js');
const nextServer = fs.existsSync(standaloneServer)
  ? standaloneServer
  : dockerServer;

if (!fs.existsSync(nextServer)) {
  throw new Error('Missing Next standalone server. Run yarn build first.');
}

const nextEnv = {
  ...process.env,
  HOSTNAME: contextPath ? '127.0.0.1' : hostname,
  PORT: String(contextPath ? internalPort : publicPort),
  // Keep the Next build reusable. Runtime context path is handled by this proxy.
  WREN_UI_CONTEXT_PATH: '/',
};

const child = childProcess.spawn(process.execPath, [nextServer], {
  cwd: root,
  env: nextEnv,
  stdio: ['ignore', 'inherit', 'inherit'],
});

const sendHealth = (res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end('OK');
};

const shutdown = (signal) => {
  child.kill(signal);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

child.on('exit', (code, signal) => {
  process.exit(code || (signal ? 1 : 0));
});

if (!contextPath) {
  console.log('WREN_UI_CONTEXT_PATH=/');
} else {
  const contextScript = () => {
    const serializedContextPath = JSON.stringify(contextPath);
    return `<script id="wren-ui-runtime-context">(function(){var c=${serializedContextPath};window.__WREN_UI_CONTEXT_PATH__=c;function p(u){if(!u||typeof u!=="string"||u.charAt(0)!=="/"||u.indexOf("//")===0||u===c||u.indexOf(c+"/")===0){return u;}return c+u;}function pu(u){try{if(u instanceof URL){if(u.origin===location.origin){u=new URL(p(u.pathname)+u.search+u.hash,location.origin);}return u;}}catch(e){}return p(u);}["pushState","replaceState"].forEach(function(n){var o=history[n];history[n]=function(s,t,u){return o.call(this,s,t,pu(u));};});if(window.fetch){var f=window.fetch;window.fetch=function(i,o){if(typeof i==="string"||i instanceof URL){return f.call(this,pu(i),o);}if(i&&typeof Request!=="undefined"&&i instanceof Request){var u=new URL(i.url,location.origin);if(u.origin===location.origin){i=new Request(new URL(p(u.pathname)+u.search+u.hash,u.origin),i);}}return f.call(this,i,o);};}if(window.XMLHttpRequest){var xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){arguments[1]=pu(u);return xo.apply(this,arguments);};}document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a||a.target&&a.target!=="_self"||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey){return;}var u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname.charAt(0)==="/"&&u.pathname!==c&&u.pathname.indexOf(c+"/")!==0){a.href=new URL(p(u.pathname)+u.search+u.hash,u.origin).href;}},true);})();</script>`;
  };

  const prefixRootPaths = (html) => {
    const escapedContext = contextPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html
      .replace('</head>', `${contextScript()}</head>`)
      .replace(
        new RegExp(
          '((?:href|src|action)=["\'])/(?!/|' + escapedContext + '(?:/|$))',
          'g',
        ),
        `$1${contextPath}/`,
      )
      .replace(/(["'])\/(_next|images|api)\//g, `$1${contextPath}/$2/`)
      .replace(/(["'])\/favicon\.ico/g, `$1${contextPath}/favicon.ico`);
  };

  const proxyRequest = (clientReq, clientRes) => {
    const originalUrl = clientReq.url || '/';
    const queryIndex = originalUrl.indexOf('?');
    const pathname =
      queryIndex === -1 ? originalUrl : originalUrl.slice(0, queryIndex);
    const search = queryIndex === -1 ? '' : originalUrl.slice(queryIndex);

    if (pathname === '/health' || pathname === `${contextPath}/health`) {
      sendHealth(clientRes);
      return;
    }

    if (pathname === '/') {
      clientRes.statusCode = 302;
      clientRes.setHeader('Location', `${contextPath}/`);
      clientRes.end();
      return;
    }

    if (pathname !== contextPath && !pathname.startsWith(`${contextPath}/`)) {
      clientRes.statusCode = 404;
      clientRes.end('Not Found');
      return;
    }

    const upstreamPath =
      pathname === contextPath
        ? '/'
        : pathname.slice(contextPath.length) || '/';
    const upstreamUrl = `${upstreamPath}${search}`;

    const headers = {
      ...clientReq.headers,
      host: `127.0.0.1:${internalPort}`,
      'accept-encoding': 'identity',
      'x-forwarded-prefix': contextPath,
    };

    const upstreamReq = http.request(
      {
        hostname: '127.0.0.1',
        port: internalPort,
        method: clientReq.method,
        path: upstreamUrl,
        headers,
      },
      (upstreamRes) => {
        const contentType = upstreamRes.headers['content-type'] || '';
        const shouldRewrite = contentType.includes('text/html');
        const headersToSend = { ...upstreamRes.headers };

        if (!shouldRewrite) {
          clientRes.writeHead(upstreamRes.statusCode || 500, headersToSend);
          upstreamRes.pipe(clientRes);
          return;
        }

        const chunks = [];
        upstreamRes.on('data', (chunk) => chunks.push(chunk));
        upstreamRes.on('end', () => {
          const body = prefixRootPaths(Buffer.concat(chunks).toString('utf8'));
          delete headersToSend['content-length'];
          clientRes.writeHead(upstreamRes.statusCode || 500, headersToSend);
          clientRes.end(body);
        });
      },
    );

    upstreamReq.on('error', (error) => {
      clientRes.statusCode = 503;
      clientRes.end(`wren-ui upstream is not ready: ${error.message}`);
    });

    clientReq.pipe(upstreamReq);
  };

  const server = http.createServer(proxyRequest);

  server.listen(publicPort, hostname, () => {
    console.log(`WREN_UI_CONTEXT_PATH=${contextPath}`);
    console.log(
      `wren-ui listening on http://${hostname}:${publicPort}${contextPath}`,
    );
    console.log(
      `wren-ui upstream listening on http://127.0.0.1:${internalPort}`,
    );
  });
}
