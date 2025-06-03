import { User } from "../../../../types/User";
import { Comment } from "../../../../types/Like";
import styles from "./EventComments.module.css";
import formatTime from "../../../../utils/formatTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import  { forwardRef } from "react";


interface EventCommentsProps {
  comments: Comment[];
  currentUser?: User;
  eventId: number;
  commentText: string;
  setCommentText: (value: string) => void;
  handleAddComment: (eventId: number) => void;
  handleEditComment: (comment: Comment) => void;
  handleDeleteComment: (commentId: number) => void;
  editingCommentId: number | null;
  editedCommentText: string;
  setEditingCommentId: (id: number | null) => void;
  setEditedCommentText: (text: string) => void;
  saveEditedComment: (commentId: number) => void;
}

const EventComments = forwardRef<HTMLTextAreaElement, EventCommentsProps>(({
  comments,
  currentUser,
  eventId,
  commentText,
  setCommentText,
  handleAddComment,
  handleEditComment,
  handleDeleteComment,
  editingCommentId,
  editedCommentText,
  setEditingCommentId,
  setEditedCommentText,
  saveEditedComment,
}, ref)=> {

    return (
        <div className={styles.commentContainer} id="eventComments">
            <div className={styles.commentContainerAlt}>
                <ul> 
                    {comments
                        .sort((a,b) => {
                            const timeA = new Date(a.sentAt)
                            const timeB = new Date(b.sentAt);
                            return timeA.getTime() - timeB.getTime()
                            })
                            .map(comment => (
                                <li className={styles.commentItem}>
                                    <div className={styles.commentHeader}>
                                        <div className={styles.senderInfo}>
                                            <img src={comment.sender.profilePictureUrl} alt="User Avatar" />
                                            <span className={styles.username}>{comment.sender.username}</span>
                                        </div>
                                        <span> {comment.sentAt !== comment.updatedAt ? "edited" : ""}</span>
                                        <span className={styles.timestamp}>{formatTime(comment.updatedAt)}</span>
                                    </div>
                                    {editingCommentId === comment.commentId ? (
                                        <div className={styles.editArea}>
                                            <input 
                                                                  type="text"
                                                                  value={editedCommentText}
                                                                  onChange={(e) => setEditedCommentText(e.target.value)}
                                                                />
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
                                                                  className={styles.actionIcon}
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
                                                      maxLength={600}
                                                      minLength={1}
                                                      rows={1}
                                                      onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                      }}
                                                      placeholder="Add a comment..."
                                                      value={commentText}
                                                      onChange={(e) => setCommentText(e.target.value)}
                                                      onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                          e.preventDefault();
                                                          handleAddComment(eventId);
                                                        }
                                                      }}
                                                      className={styles.commentInput}
                                                    />

                                              </div>
                                  </div>
                          </div>
    )
});

export default EventComments;