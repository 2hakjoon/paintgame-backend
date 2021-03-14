import { Socket } from "socket.io";
import { rndColor, unlockColor } from "../Colors";
import { rndWord } from "../Words";
import commends from "./commend";
import { notice } from "./gameNotice";


let gameState = false;
let userList = [];
let word = "";


const gameStart = (io) => {
    if(userList.length >= 2 && gameState==false){
        gameState = true;
        io.emit(commends.gameStarted, {data : notice.gameStart})
        setTimeout(()=>countDown(io, 3), 1000);
        setTimeout(()=>selcetPainter(io), 5000);
        setTimeout(()=>countDown(io, 60), 4000);
    }
}

const gameEnd = (io, user) => {
    gameState = false;
    io.emit(commends.countDown, ``)
    io.emit(commends.painterNotif, ``)
    if(user!==undefined){
        io.emit(commends.newMsg, {data : {...notice.answered, text: `${user}님이 정답을 맞추셨습니다!` }});
    }
    io.emit(commends.gameEnded, ``);
    scoreBoard(io);
    setTimeout(()=>gameStart(io), 2000);
}

const countDown = (io, sec) => {
    let cnt = sec;
    const count = setInterval(()=>{
        if(sec===60){
            io.emit(commends.countDown, `남은시간 : ${cnt} 초`)
        }
        else{
            if(gameState == true){
                io.emit(commends.newMsg, {data : {...notice.freeNotice, text: cnt}})
            }
        }

        cnt = cnt-1;
        if((cnt == 0) && (sec == 60)){
            io.emit(commends.newMsg, {data : {...notice.freeNotice, text: `정답은 < ${word} > 였습니다.!`}})
            gameEnd(io);
        }
        if((cnt == 0) || (gameState == false)){
            io.emit(commends.countDown, ``)
            clearInterval(count);
        }
    }, 1000);

}

const selcetPainter = (io) => {
    if(gameState == true){
        word = rndWord();
        const painter = userList[Math.floor(Math.random() * userList.length)];
        userList.map((user)=>{
            if(user.socket === painter.socket){
                io.to(painter.socket).emit(commends.newMsg, {data : {...notice.freeNotice, text: "당신이 그릴 차례입니다."}});
                io.to(painter.socket).emit(commends.painterNotif, `제시어 : ${word}`);
                io.to(painter.socket).emit(commends.enablePaint, '')
            }
            else{
                io.to(user.socket).emit(commends.newMsg, {data : {...notice.freeNotice, text: "정답을 맞춰보세요!"}, word:(rndWord().length+1)})
                io.to(user.socket).emit(commends.painterNotif, `제시어 : ${word.length}글자`)
                io.to(user.socket).emit(commends.disablePaint, ``)
            }
        })
    }
}

const scoreBoard = (io) => {
    io.emit(commends.userList, userList)
}

export const socketController = (socket, io) => {
    socket.on(commends.setNickname, (data) => {
        const userId = data
        const color = rndColor();
        if(userList)
        userList.push({
            userId : userId,
            userColor : color,
            socket : socket.id,
            score : 0
        })
        socket.emit(commends.nicknameConfirm, color);
        socket.broadcast.emit(commends.playerUpdate, {data : {...notice.freeNotice, text: `${userId}님이 입장하셨습니다.`}})
        scoreBoard(io);
        
        setTimeout(()=>gameStart(io), 500);
    
    });

    socket.on(commends.disconnect, () => {
        userList.map((user, index)=>{
            if(user.socket == socket.id){
                unlockColor(user.userColor)
                userList.splice(index, 1);
                const username = user.userId;
                io.emit(commends.newMsg, {data : {...notice.freeNotice, text: `${username}님이 퇴장하셨습니다.`}});
            }
            scoreBoard(io);
            if(userList.length < 2 && gameState==true){
                io.emit(commends.newMsg, {data : {...notice.freeNotice, text: `게임이 종료되었습니다.`}});
                gameEnd(io);
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
        if(word === data.text){
            userList.map((user)=>{
                if(user.userId === data.user){
                    user.score = user.score + 10;
                }
            })
            gameEnd(io, data.user);
        }
    })
}