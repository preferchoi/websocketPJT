## socket.io의 join/leave 기능을 사용하지 않고, 동적 라우팅 진행.
방 생성 요청을 받을 때, 다음과 같이 동적 라우팅을 진행하여 새로운 네임스페이스를 선언했다. 아래 코드는 새로운 게임 룸을 생성 요청하는 API이다.

```
app.get('/:nsp/create_room', (req, res) => {
    const nspName = req.params.nsp;
    const roomName = req.query.roomName
    const roomLimit = parseInt(req.query.roomLimit, 10) || 8

    if (!serverEndPoint[nspName]['rooms'][roomName]) {
        const nsp = io.of(`/${nspName}/${roomName}`);
        const info = {
            'connection_now': 0,
            'connection_limit': roomLimit,
            'isAbleConnect': true,
        };
        serverEndPoint[nspName]['rooms'][roomName] = info
        nsp.on('connection', (socket) => {
            if (info['connection_now'] < info['connection_limit']) {
                info['connection_now'] += 1
                if (info['connection_now'] === info['connection_limit']) {
                    info['isAbleConnect'] = false
                }
            }

            socket.on('disconnect', () => {
                info['connection_now'] -= 1;
                if (info['connection_now'] < info['connection_limit']) {
                    info['isAbleConnect'] = true
                }
            });
        });
        res.json('success');
    } else {
        res.json('fail');
    }
});
```

이렇게 한 이유는 다음과 같다.
- 해당 프로젝트는 간단한 게임 시스템을 적용할 예정이기 때문이다. <br>
join/leave 방식을 활용할 경우엔, 서버 이상이 발생하여 해당 nsp가 종료될 경우 nsp에 연결되어 있는 모든 room이 종료될 것이다. <br>
서버 점검 시, 에러 발생 시와 같은 경우 게임을 진행중인 room을 종료 시까지 안정적으로 유지하기 위해서 새로운 nsp를 선언해 독립성을 부여하는 방식으로 코드를 작성하였다. <br>
관리를 용이하기 위해서 nsp 선언 시 명칭에 부모 nsp의 이름을 추가하는 방식으로 연관성을 표시하였다.

클라이언트 연결이 종료될 경우, 접속한 클라이언트가 없는 경우 disconnectSockets 메소드를 활용하여 해당 nsp를 삭제하게끔 하였다.