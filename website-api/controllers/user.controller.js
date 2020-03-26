const User = require('../models/user');
const { POST_USER, DELETE_USER, UPDATE_USER} = require('../actions/user.action');

async function userController(ws, socket, message) {
    const body =  JSON.parse(message);
        
    switch(body.type) {
        case POST_USER: 
            let user = new User({ 
                name: body.data.name,
                email: body.data.email,
            });
            await user.save();
    
            ws.clients.forEach(async function e(client) {
                if (client != socket) {
                    const fetchUsers = await User.find();
                    const resUsers = JSON.stringify({allUsers: fetchUsers});
                    client.send(resUsers);
                }
            });


        case DELETE_USER: 
            const userdel = await User.findByIdAndRemove(body.params);
            if (!userdel) return response.status(404).send('Error');
    
            const fetchUsers = await User.find();
            const resUsers = JSON.stringify({allUsers: fetchUsers});
            socket.send(resUsers);
    
            
        case UPDATE_USER: 
            const Updateuser = await User.findByIdAndUpdate(body.params, {
                name: body.data.name,
                email: body.data.email,
                new: true
            });
            if (!Updateuser) return response.status(404).send('Genre not updated');
    
            ws.clients.forEach(async function e(client) {
                const fetchUsers = await User.find();
                const resUsers = JSON.stringify({allUsers: fetchUsers});
                client.send(resUsers);
            });
    }
};

async function preloadUsers(socket) {
    const fetchUsers = await User.find();
    const resUsers = JSON.stringify({allUsers: fetchUsers});
    socket.send(resUsers);
}

module.exports = {
    userController,
    preloadUsers
}