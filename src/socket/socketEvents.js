import commends from "./commend";

export const socketController = (socket, io) => {
    console.log(io)
    socket.emit('setCommend', commends);

    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnect');
    });
    
    socket.on('init', data => {
        console.log(data.name);
        socket.emit('welcome', 'message: ' + data.name);
    });

    socket.on(commends.beginPath, ({x, y})=>{
        socket.broadcast.emit(commends.beganPath, {x, y})
    });

    socket.on(commends.strokePath, ({x, y , color})=>{
        socket.broadcast.emit(commends.strokedPath, {x, y, color})
    });

    socket.on(commends.fill, (color)=>{
        socket.broadcast.emit(commends.fill, {color})
    });
    socket.on(commends.sendMsg, (data)=>{
        socket.broadcast.emit(commends.newMsg, {data})
    })
}