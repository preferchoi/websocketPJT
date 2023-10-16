import { useState, useEffect } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const [serverList, setServerList] = useState({})

  const handleServerClick = (serverName) => {
    navigate(`/${serverName}`);
  };

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
        <div key={index} onClick={() => {serverList[server]?.connect ? handleServerClick(serverList[server]?.name) : alert('다른 서버를 선택해주세요.')}}>
          서버: {serverList[server]?.name} <br/>
          서버 상태: {serverList[server]?.connect? '접속 가능' : '접속 불가능' } <br/>
          접속인원: {serverList[server]?.usersLength}/100
          <hr/>
        </div>
      ))}
    </>
  )
}

export default App
