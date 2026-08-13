import webview

webview.create_window(
    "ELOCIA",
    "http://localhost:5173",
    width=1280,
    height=820,
    resizable=False,
)

webview.start()