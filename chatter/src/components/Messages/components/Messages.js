import React, { useEffect, useContext, useState } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import InitialBottyMessage from '../../../common/constants/initialBottyMessage';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';

const ME = 'me';
const BOT = 'bot';
const firstMessage = { message: InitialBottyMessage, user: BOT, id: Date.now() };

const socket = io('http://localhost:4001/', { transports: [ 'websocket', 'polling', 'flashsocket' ] });

function Messages() {
	const [ message, setMessage ] = useState('');
	const [ chat, setChat ] = useState([ firstMessage ]);
	const [ botTyping, setBotTyping ] = useState(false);
	const [ playSend ] = useSound(config.SEND_AUDIO_URL);
	const [ playReceive ] = useSound(config.RECEIVE_AUDIO_URL);
	const { setLatestMessage } = useContext(LatestMessagesContext);

	useEffect(
		() => {
			socket.on('bot-message', (message) => {
				setBotTyping(false);
				setChat([ ...chat, { message, user: BOT, id: Date.now() } ]);
				playReceive();
			});
		},
		[ chat ]
	);
	useEffect(() => {
		socket.on('bot-typing', () => {
			setBotTyping(true);
		});
	}, []);
	const sendMessage = () => {
		setChat([ ...chat, { message, user: ME, id: Date.now() } ]);
		socket.emit('user-message', message);
		playSend();
		setMessage('');
		document.getElementById('user-message-input').value = '';
	};
	const onChangeMessage = (e) => {
		setMessage(e.target.value);
	};
	return (
		<div className="messages">
			<Header />
			<div className="messages__list" id="message-list">
				{chat.map((message) => <Message message={message} botTyping={botTyping} />)}
				{botTyping ? <TypingMessage /> : null}
			</div>
			<Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
		</div>
	);
}
export default Messages;
