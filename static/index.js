if (window.localStorage.hasOwnProperty("username") == false) {  // if localstorage does not have a username value then ask for it and store it, if already a username then get it
    username = window.prompt("Your username","username");
    window.localStorage.setItem("username", username);
} 

else {
    username = window.localStorage.getItem("username");
}

function showUsername() { // places username on element with id username
    document.getElementById("username").innerHTML = username;
}

function showChatname() { // if there is no chatname then write 'select a chat' on element with id chatnamejs 
    if (window.localStorage.hasOwnProperty("chatname") == false) {
        document.getElementById("chatnamejs").innerHTML = "Select a chat";
    } 
    
    else { // if there is a chatname then take it from element with id chatname and put it in element with id chatnamejs
        chatname_txt = window.localStorage.getItem("chatname")
        document.getElementById("chatnamejs").innerHTML = chatname_txt;
    }
}

function storeChatname() { // take element with id chatnameflask and localstorage it 
    chatname_txt = document.getElementById("chatnameflask").innerHTML;
    window.localStorage.setItem("chatname", chatname_txt);
}

function showMessages() { // makes http request to open chatsapi route and creates json with chats and messages on each and inserts the message as a li element on the list with id messages
    const request = new XMLHttpRequest();
    request.open('POST', '/chatsapi');
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        console.log(chatname_txt)
        if (data[chatname_txt]) {
            arr = data[chatname_txt];
            for (var i = 0; i < arr.length; i++) {
                const li = document.createElement('li');
                li.innerHTML = arr[i].split('::')[0];
                li.style.color = arr[i].split('::')[1];
                document.querySelector('#messages').append(li);
            }
        }
    }
    request.send();
};

document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);  // connects to websocket
    socket.on('connect', () => {        
        document.querySelector('#createchat').onclick = () => { // releases an event to take element of chatname id and emit it
                var chatname = document.querySelector('#chatname').value;
                if (chatname == '') {
                    alert('Please, enter a name.');
                } 
                
                else {
                    socket.emit('create chat', {'chatname':chatname});
                }
        };

        document.querySelector('#newmessage').onclick = () => { // releases an event to take element of id message and emit it along with date and username
            var message = document.querySelector('#message').value;
            var color = document.querySelector('#colorsel').value;
            if (message == '') {
                alert('Please, write a message.')
            } 
            
            else {
                var d = new Date();
                date = d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
                message = date + " " + username + " wrote: " + message + '::' + chatname_txt  + '::' + color;;
                socket.emit('send message', {'message':message});
            }
        };
    });
   
    socket.on('all chats', data => { // when new chatname is emitted, check if exists and add it as a li element to the list with id chats and clear field with id chatname
        if (data == 'Raise:error') {
            alert('Chatname already exists.');
            document.querySelector('#chatname').value = '';
        } 

        else {
        const li = document.createElement('li');
        li.innerHTML = "<a href='/chats/"+data+"'>"+data+"</a></li>"; 
        document.querySelector('#chats').append(li);
        document.querySelector('#chatname').value = '';
        }
    });

    socket.on('messages', data => {  // when new message is emitted add it as a li element to the list with id messages and clear field with id message
        const li = document.createElement('li');
        li.innerHTML = data.split('::')[0];
        li.style.color = data.split('::')[1];
        document.querySelector('#messages').append(li);
        document.querySelector('#message').value = '';
    });
});