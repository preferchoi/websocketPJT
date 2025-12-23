import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const ChatLog = ({ messages }) => {
    const [imageUrls, setImageUrls] = useState({});

    useEffect(() => {
        const urls = messages.reduce((acc, message) => {
            if (message.type === 'image') {
                const { data, mimeType } = message.content || {};
                const blob = new Blob([data], { type: mimeType || 'image/jpeg' });
                acc[message.id] = URL.createObjectURL(blob);
            }
            return acc;
        }, {});

        setImageUrls(urls);

        return () => {
            Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [messages]);

    return (
        <>
            <h3>채팅 로그</h3>
            <div className='chatLog'>
                {messages.map((message) => {
                    if (message.type === 'text') {
                        return <div key={message.id}>{message.content}</div>
                    } else if (message.type === 'image') {
                        const url = imageUrls[message.id];
                        return url ? <div key={message.id}><img src={url} alt="img" /></div> : null;
                    } else {
                        return null
                    }
                })}
            </div>
        </>
    );
};

ChatLog.propTypes = {
    messages: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            type: PropTypes.string.isRequired,
            content: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.shape({
                    data: PropTypes.any,
                    mimeType: PropTypes.string,
                }),
            ]),
        })
    ).isRequired,
};

export default ChatLog;
