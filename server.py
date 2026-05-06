from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent


class CleanRouteHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        request_path = unquote(urlsplit(path).path).strip("/")
        if not request_path:
            return str(ROOT / "index.html")

        direct = ROOT / request_path
        if direct.is_file() or direct.is_dir():
            return str(direct)

        html = ROOT / f"{request_path}.html"
        if html.is_file():
            return str(html)

        return str(direct)

    def do_GET(self):
        if urlsplit(self.path).path.rstrip("/") in {"/home", "/home/home"}:
            self.send_response(301)
            self.send_header("Location", "/")
            self.end_headers()
            return
        super().do_GET()

    def do_HEAD(self):
        if urlsplit(self.path).path.rstrip("/") in {"/home", "/home/home"}:
            self.send_response(301)
            self.send_header("Location", "/")
            self.end_headers()
            return
        super().do_HEAD()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), CleanRouteHandler)
    print("Serving http://127.0.0.1:8000/")
    server.serve_forever()
