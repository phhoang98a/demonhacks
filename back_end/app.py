from flask import Flask, request
import cv2
from flask_cors import CORS
from pymongo import MongoClient
from azure.storage.blob import BlobServiceClient
import os
import numpy as np
import face_recognition
import base64
import string, random
import smtplib
from email.message import EmailMessage

app = Flask(__name__)
CORS(app)
app.config.from_pyfile('config.py')

account = app.config['ACCOUNT_NAME']   # Azure account name
key = app.config['ACCOUNT_KEY']      # Azure Storage account access key  
connection_string = app.config['CONNECTION_STRING']
container = app.config['CONTAINER'] # Container name

client = MongoClient("mongodb+srv://hoangph7298:Hoangtrang123@cluster0.lnrf9cy.mongodb.net/?retryWrites=true&w=majority")
blob_service_client = BlobServiceClient.from_connection_string(connection_string)
db = client["receptionist"]
users = db["users"]
candies = db["candy"]

def getEmbeddings():
    data = list(users.find({}))
    known_face_encodings = []
    known_face_names = []
    for i in range(len(data)):
      name = data[i]['username']
      image = data[i]['image']
      blob  = blob_service_client.get_blob_client(container = container, blob = image)
      data = blob.download_blob().readall()
      arr = np.asarray(bytearray(data), dtype=np.uint8)
      sampleImage = cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)
      face_embedding = face_recognition.face_encodings(sampleImage)[0]
      known_face_encodings.append(face_embedding)
      known_face_names.append(name)
    
    return known_face_encodings, known_face_names

def id_generator(size=16, chars=string.ascii_uppercase + string.digits):
  return ''.join(random.choice(chars) for _ in range(size))

def clearFolder(file):
  os.remove(file)

@app.route('/email', methods=["POST"])
def send_email():
    email_address = "henryphan7298@gmail.com"
    email_password = "zdunvdtknxxjfiry"

    data = list(users.find({}))

    candy = list(candies.find({},{'_id': False}))
    listCandies = {}
    for i in range(len(candy)):
      listCandies[candy[i]['type']] = candy[i]['number'] 
    for i in range(len(data)):
      # create email
      msg = EmailMessage()
      msg['Subject'] = "Halloween Exchange Candy"
      msg['From'] = email_address
      msg['To'] = data[i]['email']
      message = "Hi "+ data[i]['username'] + ", we found that you really enjoy "
      for j in range(len(data[i]['hobby'])):
        message += data[i]['hobby'][j]+"("+str(listCandies[data[i]['hobby'][j]])+") "
      message += "candies. Please come and exchange. Happy Halloween!"
      msg.set_content(message)

      # send email
      with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
          smtp.login(email_address, email_password)
          smtp.send_message(msg) 
    
    return({
        "status": 200,
    }) 

@app.route('/candy', methods=["POST", "GET"]) 
def getListOfCandies():
  if request.method == "GET":
    data = list(candies.find({},{'_id': False}))
    return({
        "status": 200, 
        "listOfCandies": data,
    }) 
  else:
    body = request.json
    type = body['type']
    listCanides = body['listCandies']
    point = body['total']
    name = body['name']
    if int(type)==1:
      users.update_one({'username':name},{'$inc':{'point': point}})
      for key, value in listCanides.items():
        candies.update_one({'type':key},{'$inc':{'number': value}})
    else:
      users.update_one({'username':name},{'$inc':{'point': -point}})
      for key, value in listCanides.items():
        candies.update_one({'type':key},{'$inc':{'number': -value}})

    return({
        "status": 200,
    }) 

@app.route('/authentication', methods=["POST"])
def authentication():
  body = request.json
  image = body['image']
  known_face_encodings, known_face_names = getEmbeddings()
  imgstring = image
  encoded_data = imgstring.split(',')[1]
  nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
  img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
  faces = face_recognition.face_encodings(img)
  if len(faces)==0:
    return({
      "status":401,
      "msg": "Image lacks facial features"
    })
  
  embedding = faces[0]
  matches = face_recognition.compare_faces(known_face_encodings, embedding, 0.4)
  name = "Customer"
  data = []
  if True in matches:
      first_match_index = matches.index(True)
      name = known_face_names[first_match_index]
      data = list(users.find({'username':name},{'_id': False}))
  
  return({
    "status":200,
    "name": name,
    "information": data
  })

@app.route('/user', methods=["POST"])
def getUser():
  body = request.json
  name = body['name']
  data = list(users.find({'username':name},{'_id': False}))
  data[0]['image'] = 'https://noteapp2022.blob.core.windows.net/images/'+data[0]['image']
  return({
    "status":200,
    "information": data
  })

@app.route('/signup', methods=["POST"])
def signUp():
  body = request.json
  username = body['username']
  images = body['image']
  email = body['email']
  hobby = body['hobby']

  #check if username already exists
  data = list(users.find({'username': username}))
  if len(data)>0:
    return({
      "status": 401, 
      "msg": "Username already exists"
    })

  # convert base64 string to img.
  imgstring = images[0]
  encoded_data = imgstring.split(',')[1]
  nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
  img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
  randomString = id_generator()
  filename = username + "_" +randomString+"_"+".jpg"
  cv2.imwrite(filename, img)
  imageUrls = filename

  # check if image has face. 

  image = cv2.imread(imageUrls)
  if len(image.shape)==2:
    image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
  faces = face_recognition.face_encodings(image)
  if len(faces)==0:
    clearFolder(imageUrls)
    return({
      "status":401,
      "msg": "File lacks facial features"
    })

  # add to azure 
  filename = imageUrls
  blob_client = blob_service_client.get_blob_client(container = container, blob = filename)
  with open(filename, "rb") as data:
    try:
        blob_client.upload_blob(data, overwrite=True)
        azureFilename = filename
    except:
        clearFolder(imageUrls)
        return({
          "status": 401,
          "msg": "System error, please try again later."
        })

  users.insert_one({
    'username': username,
    "image": azureFilename,
    "email": email,
    "hobby": hobby,
    "point":0
  })

  clearFolder(imageUrls)

  return({
    "status": 200,
    "msg": "Register successfully. Please reset to exchange the candies."
  })

if __name__ == '__main__':
  port = int(os.environ.get('PORT', 5000))
  app.run(host='0.0.0.0', port=port)