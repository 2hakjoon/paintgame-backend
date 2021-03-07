import { Socket } from "socket.io";
import { rndColor, unlockColor } from "../Colors";
import { rndWord } from "../Words";
import commends from "./commend";
import { notice } from "./gameNotice";


let gameState = false;
let userList = [];



const gameStart = (io) => {
    gameState = true;
    io.emit(commends.gameStarted, {data : notice.gameStart})
    setTimeout(()=>countDown(io, 3), 1000);
    setTimeout(()=>selcetPainter(io), 5000)
}

const gameEnd = (io) => {
    gameState = false;
    io.emit(commends.gameEnded, {data : notice.gameEnd})
}

const countDown = (io, sec) => {
    let cnt = sec;
    const count = setInterval(()=>{
        io.emit(commends.newMsg, {data : {...notice.freeNotice, text: cnt}})
        cnt = cnt-1;
        if(cnt == 0){
            clearInterval(count);
        }
    }, 1000);

}

const selcetPainter = (io) => {
    const word = rndWord();
    const painter = userList[Math.floor(Math.random() * userList.length)];
    userList.map((user)=>{
        if(user.socket === painter.socket){
            io.to(painter.socket).emit(commends.newMsg, {data : {...notice.freeNotice, text: "당신이 그릴 차례입니다."}})
            io.to(painter.socket).emit(commends.painterNotif, word)
        }
        else{
            io.to(user.socket).emit(commends.newMsg, {data : {...notice.freeNotice, text: "정답을 맞춰보세요!"}, word:(rndWord().length+1)})
            io.to(user.socket).emit(commends.painterNotif, `${word.length}글자`)
        }
    })
    
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
                unlockColor(user.userColor)
                userList.splice(index, 1);
            }
            if(userList.length < 2 && gameState==true){
                setTimeout(()=>gameEnd(io), 500);
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