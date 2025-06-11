import { User } from "../../../../types/User";
import styles from "./EventComments.module.css";
import formatTime from "../../../../utils/formatTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import  { Dispatch, forwardRef, SetStateAction, useEffect } from "react";
import { useState, useRef } from "react";
import axiosInstance from "../../../../axios/axios";
import { Event } from "../../../../types/Event";


interface EventCommentsProps {
  currentUser?: User;
  event: Event;
  setEvent: Dispatch<SetStateAction<Event>>;
}

const EventComments = forwardRef<HTMLTextAreaElement, EventCommentsProps>(({
  currentUser,
  event,
  setEvent
}, ref)=> {

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState<string>('');
  const [commentString, setCommentString] = useState('');

  const handleAddComment = async (eventId: number) => {

    try {
        const newComment = {
          commentId: null,
          comment: commentString,
          eventId: event.id,
          sender: currentUser,
          sentAt: '',
          updatedAt: '',
        };

      const response = await axiosInstance.post(`/comment/${eventId}`, newComment)
    
      setEvent(prev => ({ ...prev, comments: [...prev.comments, response.data] }));

      setCommentString('');
    } catch(error) {
    }
  }

  const handleDeleteComment = async (commentId: number) => {  

      try {
        await axiosInstance.delete(`/comment/${commentId}`);
        setEvent(prev => ({
          ...prev,
          comments: prev.comments.filter(comment => comment.commentId !== commentId)
        }));
      } catch (error) {
        console.error("Error deleting comment.")
      }
    }

    const handleEditComment = (comment: any) => {
      setEditingCommentId(comment.commentId);
      setEditedCommentText(comment.comment);
    };

    const saveEditedComment = async (commentId: number) => {
      await handleUpdateComment(commentId, editedCommentText);
      setEditingCommentId(null);
      setEditedCommentText('');
    };

    const handleUpdateComment = async (commentId: number, updatedComment: string) => {
      try {
        await axiosInstance.put(`/comment/${commentId}`, { 
          commentId: commentId,
          comment: updatedComment,
          eventId: event.id,
          sender: currentUser,
          updatedAt: new Date().toISOString()
        });

        setEvent(prev => ({
          ...prev,
          comments: prev.comments.map(comment =>
            comment.commentId === commentId ? { ...comment, comment: updatedComment } : comment
          )
        }));

      } catch (error) {
        console.error("Error updating comment.");
      }
    }

    const editedAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

      const handleMouseDownListener = (event: MouseEvent) => {

        if (editedAreaRef.current && !editedAreaRef.current.contains(event.target as Node)) {
          setEditingCommentId(null);
        }
      }

      if(editingCommentId)
          document.addEventListener("mousedown", handleMouseDownListener)


      return () => {
        document.removeEventListener("mousedown", handleMouseDownListener);
      }

    }, [editingCommentId])


  useEffect(() => {

  },[event])

    return (
        <div className={styles.commentContainer} id="eventComments">
            <div className={styles.commentContainerAlt}>
                <ul> 
                    {event.comments
                        .sort((a,b) => {
                            const timeA = new Date(a.sentAt)
                            const timeB = new Date(b.sentAt);
                            return timeA.getTime() - timeB.getTime()
                            })
                            .map(comment => (
                                <li className={styles.commentItem} key={comment.commentId}>
                                    <div className={styles.commentHeader}>
                                        <div className={styles.senderInfo}>
                                            <img src={comment.sender.profilePictureUrl} alt="User Avatar" />
                                            <span className={styles.username}>{comment.sender.username}</span>
                                        </div>
                                        <div className={styles.commentHeaderInfo}>
                                          <span className={styles.timestamp}> 
                                            <strong>{comment.sentAt !== comment.updatedAt ? "(edited)" : ""}</strong>
                                          </span>
                                          <span className={styles.timestamp}>{formatTime(comment.updatedAt)}</span>
                                        </div>
                                    </div>
                                    {editingCommentId === comment.commentId ? (
                                        <div className={styles.editArea} ref={editedAreaRef}>
                                            <textarea 
                                              maxLength={500}
                                              minLength={1}
                                              value={editedCommentText}
                                              onChange={(e) => setEditedCommentText(e.target.value)}
                                            />
                                            <p className={styles.editedCommentCounter}>{editedCommentText.length}/500</p>
                                        <div className={styles.editButtons}>
                                            <button onClick={() => saveEditedComment(comment.commentId)}>Save</button>
                                            <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                                        </div>
                                      </div>
                                       ) : (
                                        <p className={styles.commentText}>{comment.comment}</p>
                                    )}

                                                            {comment.sender.username === currentUser?.username && (
                                                              <div className={styles.commentActions}>
                                                                <FontAwesomeIcon
                                                                  icon={faPenToSquare}
                                                                  className={styles.actionIcon}
                                                                  onClick={() => handleEditComment(comment)}
                                                                  title="Edit"
                                                                />
                                                                <FontAwesomeIcon
                                                                  icon={faTrash}
                                                                  className={styles.deleteIcon}
                                                                  onClick={() => handleDeleteComment(comment.commentId)}
                                                                  title="Delete"
                                                                />
                                                              </div>
                                                            )}
                                                          </li>
                                                  ))}
                                              </ul>
                                              <hr/>
                                              <div className={styles.addComment}>
                                                  <textarea
                                                      ref={ref} 
                                                      maxLength={500}
                                                      minLength={1}
                                                      rows={1}
                                                      onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                      }}
                                                      placeholder="Add a comment..."
                                                      value={commentString}
                                                      onChange={(e) => setCommentString(e.target.value)}
                                                      onFocus={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                      }}
                                                      onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                          e.preventDefault();
                                                          handleAddComment(event.id);
                                                        }
                                                      }}
                                                      className={styles.commentInput}
                                                    />
                                                    <p className={styles.commentCounter}>{commentString.length}/500</p>
                                              </div>
                                  </div>
                          </div>
    )
});

export default EventComments;