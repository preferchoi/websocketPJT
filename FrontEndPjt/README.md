### 쓰로틀링
이용자가 대량의 데이터 호출 요청을 보낼 경우, 서버 부하를 막기 위해 쓰로틀링 기법을 사용하였다.<br>
다음은 app.js에서 잦은 데이터 요청을 처리하는 코드이다.
```
const [coolTime, setCoolTime] = useState(0)

// ...

const handleGetData = () => {
setIsGetData(true) // 요청 발생 시 갱신 버튼의 disabled 속성을 true로 변경한다.
getData(); // 데이터 호출을 진행한다.
setCoolTime(3) // 제한시간을 설정한다.
setTimeout(() => {
    setIsGetData(false) // 제한 시간 뒤, 갱신 버튼을 활성화한다.
}, 3000);
};

/*
    대기 시간 시각화를 위한 코드.
    coolTime변수에서 순차적으로 1을 빼면서 보여준다.
 */
useEffect(() => {
let intervalId;
if (coolTime > 0) {
    intervalId = setInterval(() => {
    setCoolTime((prevCoolTime) => prevCoolTime - 1);
    }, 1000);
} else if (coolTime === 0) {
    clearInterval(intervalId);
}
return () => clearInterval(intervalId);
}, [coolTime])
return (
    <>
    // ...
      <button onClick={handleGetData} disabled={isGetData}>서버 상태 갱신</button>
      // ...
    </>
  )

```

그 외 선택 가능한 방법
- Debouncing
- axios.cancelToken 사용
- React Query API 활용


### 소켓 연결이 두 번씩 되는 문제 발생
```
...
    ws.on('create_room', getRoomData)
    ws.on('delete_room', getRoomData)

    return () => {
        ws.off('receive_message', addMessage);
        ws.off('connect_user', getUserData);
        ws.off('disconnect_user', getUserData);
        ws.off('create_room', getRoomData);
        ws.off('delete_room', getRoomData)
    };
}, []);

...

useEffect(() => {
    if (WS) {
        getUserData();
        getRoomData();
        return () => {
            WS.disconnect();
            setWS(null)
        };
    }
}, [WS]);

...
```
해당 코드에서 소켓 연결이 두 번씩 처리되는 문제가 발생했다.<br>
소켓 연결이 완료된 후, 소켓의 변경을 확인하기 위해 useEffect 훅으로 WS를 확인하고, 소켓 접속 시 데이터 호출을 하고, 소켓이 없을 시 라우트 이동 처리를 하려 했다.<br>
그러나 해당 훅 종료와 동시에 연결을 종료시키게 되었고, 나중에 테스트 도중 중 소켓 선언부에 있어야 할 return문 처리가 잘못된 곳에서 처리되고 있어 연결이 두 번 처리되는 문제를 확인했다.<br>
해당 문제 해결을 위해 다음과 같이 처리했다.
```
...
    ws.on('create_room', getRoomData)
    ws.on('delete_room', getRoomData)

    getUserData();
    getRoomData();

    return () => {
        ws.off('receive_message', addMessage);
        ws.off('connect_user', getUserData);
        ws.off('disconnect_user', getUserData);
        ws.off('create_room', getRoomData);
        ws.off('delete_room', getRoomData)
        ws.disconnect();
        setWS(null)
    };
}, []);
...
```
필요없는 useEffect 훅을 삭제하고, 데이터 호출을 소켓 연결과 동시에 처리했다.

### VITE에서 환경 변수 사용
후일 배포 가능성이 있어, .env 파일을 만들어 네트워크 변수를 관리하고자 했다.<br>
REACT_APP_ 접두어를 붙여 변수를 선언하고 사용하고자 했는데, 작동하지 않았다.<br>
찾아 보니, 변수 접두어를 REACT_APP_ 가 아닌 VITE_ 로 사용해야 한다는 것을 알게 되었다.