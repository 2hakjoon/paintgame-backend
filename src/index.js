import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import logger from 'morgan';
import cors from 'cors';
import commend from './socket/commend';
import {socketController} from './socket/socketEvents';

// localhost 포트 설정
const port = 4000;

const app = express();
app.set("view engine", "pug");
app.use(cors());
app.use(logger('dev'));

app.get('/', (req, res) => {
  res.send('here is back end :(');
});

// server instance
const server = http.createServer(app);

// socketio 생성후 서버 인스턴스 사용
const io = new socketIO.Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
io.on('connection', (socket) => socketController(socket, io));

server.listen(port, () => console.log(`Listening on http://localhost${port}`))
