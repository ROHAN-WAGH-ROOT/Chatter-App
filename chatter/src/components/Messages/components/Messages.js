import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';
import initialBottyMessage from '../../../common/constants/initialBottyMessage';

const socket = io.connect('http://localhost:4001', { transports: [ 'websocket', 'polling', 'flashsocket' ] });
console.log(socket);

// socket.on('bot-message', (message) => {
// 	socket.emit('bot-message', message);
// 	console.log(message);

socket.on('connect', () => {
	console.log(socket.connected);
});
socket.on('disconnect', () => {
	console.log(socket.connected);
});
function Messages(props) {
	const [ message, setMessage ] = useState('');
	const [ chat, setChat ] = useState([]);
	const [ playSend ] = useSound(config.SEND_AUDIO_URL);
	const [ playReceive ] = useSound(config.RECEIVE_AUDIO_URL);
	const { setLatestMessage } = useContext(LatestMessagesContext);
	useEffect(() => {
		socket.on('chat', (message) => {
			setChat([ ...chat, message ]);
		});
	});
	const renderChat = () => {
		return (
			<div>
				<div>{initialBottyMessage}</div>
				{chat.map((message, index) => {
					return <p key={index}>{message}</p>;
				})}
			</div>
		);
	};
	const sendMessage = (e) => {
		e.preventDefault();
		socket.on('bot-message', (message) => {
			socket.emit('bot-message', message);
			setMessage('');
		});
		playSend();
	};

	const onChangeMessage = (e) => {
		setMessage([ ...message, e.target.value ]);
	};
	const receiveMessage = () => {
		playReceive();
	};
	return (
		<div className="messages">
			<Header />
			<div className="messages__list" id="message-list">
				{renderChat()}
			</div>
			<div className="messages__message messages__message--me" id="messages__message--me">
				{message}
			</div>
			<Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
		</div>
	);
}

export default Messages;
