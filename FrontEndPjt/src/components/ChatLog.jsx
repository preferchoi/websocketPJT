import React from 'react';

const ChatLog = ({ messages }) => {
    return (
        <>
            <h3>채팅 로그</h3>
            <div className='chatLog'>
                {messages.map((message, index) => {
                    if (message.type == 'text') {
                        return <div key={index}>{message.content}</div>
                    }
                })}
            </div>
        </>
    );
};

export default ChatLog;
