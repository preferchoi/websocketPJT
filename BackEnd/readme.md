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


### room 기능 사용 고민
동적 라우팅 처리를 할 경우 서버를 따로 관리하여 처리하기 때문에 서버 안정성이 증가한다.<br>
하지만 중계용 소켓 서버와 연결을 종료하고 새로운 소켓 서버와 연결을 하기 때문에, 중계 서버에서 유저 공간을 할당받지 못하는 문제가 존재한다.<br>
물론 socket.io의 join/leave api를 사용하면 되기는 하지만, 안정성을 포기하기는 아쉽기 때문에 다른 방법을 사용해 보려고 한다.<br>
지금까지 떠올린 방안은 다음과 같다.
1. redux를 사용해, 중계 소켓 서버와 방 소켓 서버의 연결을 둘 다 저장하는 방법
2. room을 모달 창으로 띄워 페이지 이동을 없애는 방법
3. props를 사용해 현재 소켓 서버의 연결을 유지하면서 전달하는 방법
4. 중계 서버의 현재 인원을 셀 때, room에 접속해 있는 인원도 같이 셈하기.


### 기존 설계의 문제점 확인
message를 받고 보낼 때, 일반 문자열 타입으로 전송했다.<br>
이제 와서 생각해 보면, Object 타입을 정의해서 텍스트, 이미지, 파일 등등을 다른 이벤트로 처리할 것이 아니라, 하나의 이벤트로 처리했어야 했다.<br>
현재 코드는 다음과 같이 되어 있다.
```
socket.on('send_message', (data) => {
    // 메세지 처리
});

socket.on('send_image', async (data) => {
    // 이미지 처리
});
```
다시 한 번 생각해 보니, 두 개의 이벤트는 모두 클라이언트가 보낸 메세지를 확인하고, 메세지의 타입에 맞춰 다른 클라이언트에게 전달하는 기능을 하기 때문에, 효율성을 위해 하나로 묶어 이벤트 처리를 하는 편이 더 나았을 것이라 생각한다.<br>
예를 들면, 다음과 같이 처리할 수 있을 것이다.
```
/*
{
    type: String, // text, image, file ...
    message: {
        userId: Socket_id,
        message: String, // text, blob, file ...
    }
}
 */

socket.on('send', (data) => {
    if (data.type=='message') {
        // 메세지 처리
    } else if (data.type=='image') {
        // 이미지 처리
    }
})
```
이렇게 처리했다면, 하나의 이벤트 안에서 많은 것들을 처리할 수 있어 코드 효율성이 증대되었을 것이라 생각한다.