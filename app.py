from flask import Flask, render_template, Response,send_from_directory
from flask_socketio import SocketIO
import base64, time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
latest_frame = None
f=open('images/nostream.png','rb')
nostream=f.read()
f.close()

@app.route('/')
def index():
    return send_from_directory('frontend/build', 'index.html')

@app.route('/live')
def golive():
    return render_template('index.html')

@app.route('/static/js/<path:path>')
def serve_js(path):
    return send_from_directory('frontend/build/static/js', path)

@app.route('/static/css/<path:path>')
def serve_css(path):
    return send_from_directory('frontend/build/static/css', path)

@app.route('/video')
def video():
    return Response(update_frames(),mimetype='multipart/x-mixed-replace; boundary=frame')

def update_frames():
    global nostream
    while True:
        time.sleep(0.04) # adjust here for fps
        if latest_frame: yield(b'--frame\r\n'+b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
        else: yield(b'--frame\r\n'+b'Content-Type: image/jpeg\r\n\r\n' + nostream + b'\r\n')
            

@socketio.on('frame')
def handle_frame(data):
    global latest_frame
    image_data = data['image'].split(',')[1]
    latest_frame = base64.b64decode(image_data)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)