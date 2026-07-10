/**
 * ODM player route handlers (Scripted REST).
 * T2 walking skeleton: prove a scoped REST route can stream a chrome-free
 * HTML document to an authenticated browser. Real deck logic arrives in T9.
 */

export function servePlayerSkeleton(request: any, response: any): void {
    const html =
        '<!DOCTYPE html>' +
        '<html><head><title>ODM</title></head>' +
        '<body style="margin:0;display:grid;place-items:center;height:100vh;background:#111;color:#eee;font-family:sans-serif">' +
        '<div><h1>ODM OK</h1><p>Walking skeleton — served by Scripted REST, zero platform chrome.</p></div>' +
        '</body></html>'
    response.setContentType('text/html')
    response.setStatus(200)
    response.getStreamWriter().writeString(html)
}
