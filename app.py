from flask import Flask, abort, render_template

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template("index.html", title="Las tres puertas")


@app.route("/puertas")
def puertas():
    return render_template("puertas.html")


@app.route("/puerta-1")
def puerta_1():
    return render_template("puerta_1.html")


@app.route("/puerta-2")
def puerta_2():
    return render_template("puerta_2.html")


@app.route("/puerta-3")
def puerta_3():
    return render_template(
        "puerta_4.html",
        imagen="meta.png",
        descripcion="Meta",
        mostrar_opciones=False,
        audio_filename="audio.mp3",
    )


@app.route("/puerta-4/<resultado>")
def puerta_4(resultado):
    resultados = {
        "meta": ("meta.png", "Meta"),
        "sin-salida": ("camino sin salida.png", "Camino sin salida"),
    }
    if resultado not in resultados:
        abort(404)

    imagen, descripcion = resultados[resultado]
    return render_template(
        "puerta_4.html",
        imagen=imagen,
        descripcion=descripcion,
        mostrar_opciones=True,
        audio_filename="backrooms.mp3" if resultado == "sin-salida" else None,
    )
