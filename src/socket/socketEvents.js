import { rndColor } from "../Colors";
import commends from "./commend";

let userList = [];
export const socketController = (socket, io) => {
    socket.on('setNickname', (data) => {
        const color = rndColor();
        if(userList)
        userList.push({
            userId : data,
            userColor : color
        })
        console.log(userList)
        socket.emit(commends.nicknameConfirm, color);
    });

    socket.on('disconnect', () => {
        console.log('User disconnect');
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