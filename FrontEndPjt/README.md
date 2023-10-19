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