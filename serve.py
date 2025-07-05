import http.server
import ssl

HOST = '192.168.1.8'
PORT = 4443
Handler = http.server.SimpleHTTPRequestHandler

httpd = http.server.HTTPServer((HOST, PORT), Handler)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile="ssl-certificate-dev/cert.pem", keyfile="ssl-certificate-dev/key.pem")

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"Serving on https://{HOST}:{PORT}")
httpd.serve_forever()