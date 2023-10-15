import { useState, useEffect } from 'react'
import axios from "axios";

function App() {
  const [serverList, setServerList] = useState({})
  useEffect(()=>{
    const getData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/mainserver');
        setServerList(res.data);
        console.log(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    getData();
  },[])

  return (
    <>
      {Object.keys(serverList).map((server, index) => (
        <div key={index}>
          서버: {serverList[server]?.name} <br/>
          서버 상태: {serverList[server]?.connect? '접속 가능' : '접속 불가능' } <br/>
          접속인원: {serverList[server]?.roomsLength}/100
          <hr/>
        </div>
      ))}
    </>
  )
}

export default App
