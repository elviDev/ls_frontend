import { useEffect, Dispatch } from 'react';
import { ChatAction } from '../state/chat-actions';
import { TypingIndicator } from '../types';

export function useTypingCleanup(
  typingUsers: TypingIndicator[],
  dispatch: Dispatch<ChatAction>
) {
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      typingUsers.forEach((typing) => {
        if (now.getTime() - typing.timestamp.getTime() > 5000) {
          dispatch({ type: 'CLEAR_TYPING', payload: typing.userId });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [typingUsers, dispatch]);
}