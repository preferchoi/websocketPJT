import React from 'react';

const ChatLog = ({ messages }) => {
    return (
        <>
            <h3>채팅 로그</h3>
            <div className='chatLog'>
                {messages.map((message, index) => {
                    if (message.type == 'text') {
                        return <div key={index}>{message.content}</div>
                    } else if (message.type === 'image') {
                        const blob = new Blob([message.content], { type: 'image/jpeg' })
                        const url = URL.createObjectURL(blob);
                        return <div key={index}><img src={url} alt="img" /></div>
                    } else {
                        return null
                    }
                })}
            </div>
        </>
    );
};

export default ChatLog;
