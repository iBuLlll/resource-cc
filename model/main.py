import os
from google.cloud import storage
import tensorflow as tf 
from flask import Flask, request, jsonify
from keras.models import load_model
import numpy as np
from keras.applications.mobilenet_v2 import preprocess_input
from PIL import Image
from google.cloud import firestore
import io

app = Flask(__name__)
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'ML-API2.json'  # Credential API/ Buckets
storage_client = storage.Client()
bucket_name = 'machine_learning_model12'  # Enter your bucket name here
bucket = storage_client.bucket(bucket_name)

def req(y_true, y_pred):
    req = tf.metrics.req(y_true, y_pred)[1]
    tf.keras.backend.get_session().run(tf.local_variables_initializer())
    return req

model = load_model('Recycleme-Model.h5', custom_objects={'req': req})
db = firestore.Client()  # Proper initialization of Firestore client

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            print(request)
            file = request.files['image']
            print(file)
            if not file:
                return jsonify({'message': 'No file uploaded'}), 400
                
            # Save file to Google Cloud Storage
            blob = bucket.blob(file.filename)
            blob.upload_from_string(file.read(), content_type=file.content_type)
            file.seek(0)  # Move cursor back to the beginning of the file before processing

            img = Image.open(file.stream)
            img = img.resize((224, 224))
            x = np.array(img)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)
            images = np.vstack([x])

            pred_sampah = model.predict(images)
            max_pred = pred_sampah.max()

              # Convert confidence to integer percentage
            confidence_percent = f"{round(max_pred * 100)}%"

            categories = ['Limbah B3', 'Limbah Organik', 'Recycle', 'Limbah Residu']

            predicted_category = categories[np.argmax(pred_sampah)]

            if max_pred <= 0.75:
                return jsonify({'message': 'Sampah tidak terdeteksi'}), 400

            response_message = {
                'Limbah B3': 'Limbah ini termasuk Bahan Berbahaya dan Beracun. Harap Buang sesuai prodesur khusus di fasilitas pengelolaan limbah berbahaya.',
                'Limbah Organik': 'Limbah ini dapat dijadikan kompos. Mohon buanglah sampah ini di tempat kompos atau diolah menjadi pupuk alam.',
                'Recycle': 'Limbah ini dapat didaur ulang. Ditunggu kedatangannya di pusat daur ulang terdekat.',
                'Limbah Residu': 'Limbah ini tidak dapat di daur ulang. Mohon buanglah sampah ini di tempat sampah residu yang telah disediakan.'
            }

            result = {
                "category": predicted_category,
                "confidence": confidence_percent,
                "message": response_message[predicted_category]
            }


            # Ensure that the collection name is not empty
            collection_name = 'ml-db'
            if not collection_name:
                raise ValueError("Collection name cannot be empty")

            doc_ref = db.collection(collection_name).document()  # Use a valid collection name
            doc_ref.set({
                'filename': file.filename,
                'category': result['category'],
                'confidence': confidence_percent,
                'storage_url': blob.public_url
            })

            return jsonify(result), 200

        except Exception as e:
            return jsonify({'message': 'Error processing image', 'error': str(e)}), 500

    return 'OK'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
