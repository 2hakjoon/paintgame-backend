import commends from "../commend";

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
        console.log({x,y})
        socket.broadcast.emit(commends.beganPath, {x, y})
    });

    socket.on(commends.strokePath, ({x, y , color})=>{
        console.log({x,y, color})
        socket.broadcast.emit(commends.strokedPath, {x, y, color})
    });
}