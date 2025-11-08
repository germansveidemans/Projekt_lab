from app import create_app

app = create_app()
app.config["JSON_AS_ASCII"] = False


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8001, debug=True, use_reloader=False)
