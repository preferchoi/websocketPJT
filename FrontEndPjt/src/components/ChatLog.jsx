import React from 'react';

const ChatLog = ({ messages }) => {
    return (
        <div>
            <h3>채팅 로그</h3>
            {messages.map((message, index) => (
                <div key={index}>{message}</div>
            ))}
        </div>
    );
};

export default ChatLog;
