import os

from flask import Flask, session, render_template, request, jsonify, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# creates 2 empty dicts 
chatnames = {}
chatsfull = {}

# renders index.html applying the 2 previous dicts as data
@app.route("/")
def index():
	path = url_for('index')
	return render_template('index.html', chatnames=chatnames, chatsfull=chatsfull)

# broadcasts newly created chats
@socketio.on("create chat")
def vote(data):
	chatname = data["chatname"] # inserts input in a variable 
	if chatname in chatnames: # if that variable exists on chatnames dict return error, if not insert it on chatnames dict 
		chatname = 'Raise:error'
	else:
		chatnames[chatname] = chatname
	emit("all chats", chatname, broadcast=True)

# broadcasts messages
@socketio.on("send message")
def message(data):
	print(data)
	data = data['message'].split('::') # splits the message written where there are :: and converts each part into a list element
	message = data[0] # element 0 in variable message
	chatname = data[1] # element 1 in variable chatname
	color = data[2] # element 2 in variable color

	message = message + '::' + color # inserts variables message and color separated by :: in a variable messages (updates it)
	if chatname in chatsfull.keys(): # if there is already a key called as chatname variable in chatsfull dict, then insert the variable message on that key (chat name) AND IF that key reaches element 101 (aka message 101) then remove element 0 (first message) so it only shows a max of 100 messages
		chatsfull[chatname].append(message)
		if len(chatsfull[chatname])>100:
			chatsfull[chatname].pop(0)
	else:
		chatsfull[chatname] = [message] # if that chatname does not exist as a key on the chatsfull dict, then insert variable message as first element of a key called after chatname variable inside chastfull dict
	emit("messages", message, broadcast=True)


# renders a page with the chatname that you write on the route
@app.route("/chats/<string:chatname>")
def chat(chatname):
    return render_template('index.html', chatnames=chatnames, chatname=chatname, chatsfull=chatsfull)

# returns a json with every chat and the messages on it
@app.route("/chatsapi", methods=['GET','POST'])
def chatapi():
	return jsonify(chatsfull)
