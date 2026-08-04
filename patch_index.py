with open("index.html", "r") as f:
    content = f.read()
content = content.replace('type="image/svg+xml"', 'type="image/png"')
with open("index.html", "w") as f:
    f.write(content)
