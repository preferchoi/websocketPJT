import { useState, useEffect } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const [serverList, setServerList] = useState({})
  const [isGetData, setIsGetData] = useState(false)
  const [coolTime, setCoolTime] = useState(0)

  const handleServerClick = (serverName) => {
    navigate(`/${serverName}`);
  };

  useEffect(() => {
    getData();
  }, [])

  const getData = async () => {
    try {
      const res = await axios.get(`${API_URL}/mainserver`);
      setServerList(res.data);
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetData = () => {
    setIsGetData(true)
    getData();
    setCoolTime(3)
    setTimeout(() => {
      setIsGetData(false)
    }, 3000);
  };

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
      <button className='coolTime' onClick={handleGetData} disabled={isGetData}>{coolTime ? `${coolTime}초 뒤 갱신 가능` : '서버 상태 갱신'}</button>
      <div className='serverList'>
        {Object.keys(serverList).map((server, index) => (
          <div className='serverCell' key={index} onClick={() => { serverList[server]?.connect ? handleServerClick(serverList[server]?.name) : alert('다른 서버를 선택해주세요.') }}>
            서버: {serverList[server]?.name} <br />
            서버 상태: {serverList[server]?.connect ? '접속 가능' : '접속 불가능'} <br />
            접속인원: {serverList[server]?.usersLength}/100
          </div>
        ))}
      </div>
    </>
  )
}

export default App
