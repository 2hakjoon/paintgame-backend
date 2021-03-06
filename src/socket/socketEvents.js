import { Socket } from "socket.io";
import { rndColor } from "../Colors";
import commends from "./commend";
import { notice } from "./gameNotice";

let userList = [
    {
    userId: 'sag',
    userColor: 'violet',
    socket: 'XPMWtaGuYfHyTy15AAAj'
}
];
export const socketController = (socket, io) => {
    socket.on(commends.setNickname, (data) => {
        const color = rndColor();
        if(userList)
        userList.push({
            userId : data,
            userColor : color,
            socket : socket.id
        })
        console.log(userList)
        socket.emit(commends.nicknameConfirm, color);
        socket.broadcast.emit(commends.playerUpdate, {userId : data, color})
        if(userList.length >= 2){
            io.emit(commends.gameStarted, {data : notice.gameStart})
        }
    });

    socket.on(commends.disconnect, () => {
        userList.map((user, index)=>{
            if(user.socket == socket.id){
                userList.splice(index, 1);
            }
        });
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