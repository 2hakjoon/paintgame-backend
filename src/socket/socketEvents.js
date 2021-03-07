import { Socket } from "socket.io";
import { rndColor } from "../Colors";
import { rndWord } from "../Words";
import commends from "./commend";
import { notice } from "./gameNotice";


let gameState = false;
let userList = [
    {
    userId: 'sag',
    userColor: 'violet',
    socket: 'XPMWtaGuYfHyTy15AAAj'
} 
];



const gameStart = (io) => {
    io.emit(commends.gameStarted, {data : notice.gameStart})
    setTimeout(()=>countDown(io, 3), 1000);
    console.log(rndWord())
}

const countDown = (io, sec) => {
    let cnt = sec;
    const count = setInterval(()=>{
        io.emit(commends.countDown, {data : {...notice.freeNotice, text: cnt}})
        cnt = cnt-1;
        if(cnt == 0){
            clearInterval(count);
        }
    }, 1000);

}

export const socketController = (socket, io) => {
    socket.on(commends.setNickname, (data) => {
        const userId = data
        const color = rndColor();
        if(userList)
        userList.push({
            userId : userId,
            userColor : color,
            socket : socket.id
        })
        console.log(userList)
        socket.emit(commends.nicknameConfirm, color);
        socket.broadcast.emit(commends.playerUpdate, {data : {...notice.freeNotice, text: `${userId}님이 입장하셨습니다.`}})
        
        if(userList.length >= 2 && gameState==false){
            setTimeout(()=>gameStart(io), 500);
        }
    });

    socket.on(commends.disconnect, () => {
        userList.map((user, index)=>{
            if(user.socket == socket.id){
                unlockWord(user.userColor)
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