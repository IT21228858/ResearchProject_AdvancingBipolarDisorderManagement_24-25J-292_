from flask import Flask, request, jsonify
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the audio file
    file_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
    audio_file.save(file_path)

    # Optionally, process the audio file here (e.g., transcribe, analyze)
    print("Received audio file:", audio_file.filename)
    return jsonify({'message': 'Audio file successfully uploaded', 'filename': audio_file.filename}), 200

@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.json  # Expecting JSON data from the extension
    print("Received data:", data)
    
    # Process the data as needed
    response = {
        "status": "success",
        "message": "Data received successfully"
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5000)
