import { useEffect, useRef, useState } from 'react';
import styles from "./CreateEvent.module.css"
import axiosInstance from '../../../axios/axios';

const TagInput = ({ tags, setTags }: { tags: string[], setTags: (tags: string[]) => void }) => {
  const [input, setInput] = useState('');
  const [recommendedTags, setRecommendedTags] = useState<String[]>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.code === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();
      (e.nativeEvent as any).stopImmediatePropagation(); // 🔐 bu kritik
      if (input.trim() !== '' && !tags.includes(input.trim()) && input.length > 2 && input.length < 31) {
        setTags([...tags, input.trim()]);
        setInput('');
        setShowSuggestions(false);
      }
    }
  };


  const getTagRecommendations = async (query: string) => {
    try {
      const response = await axiosInstance.get(`/tags/recommended`, {
        params: { query, page: 0, size: 5 }
      });
      setRecommendedTags(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={styles.tagInputContainer}>
      <input
        type="text"
        maxLength={20}
        minLength={2}
        disabled={tags.length >= 4}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          getTagRecommendations(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={tags.length >= 4 ? "Tag limit is reached." : "Enter tags..."}
        style={{ border: "none", outline: "none" }}
      />
      <div className={styles.tagShow}>
        <hr />
        <ul>
          {tags.map((tag, index) => (
            <li key={index}>
              <label onClick={() => setTags(tags.filter((_, i) => i !== index))}>
                #{tag}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {showSuggestions && recommendedTags && recommendedTags.length > 0 && (
        <div className={styles.recommendedTagsContainer}>
          {recommendedTags.map((tag, index) => (
            <div
              key={index}
              className={styles.recommendedTag}
              onClick={() => {
                if (!tags.includes(tag as string) && tags.length < 4) {
                  setTags([...tags, tag as string]);
                  setInput('');
                  setShowSuggestions(false);
                }
              }}
            >
              #{tag}
            </div>
          ))}
        </div>
      )}
      <p className={styles.tagCounter}>{input.length}/20</p>
    </div>
  );
};

export default TagInput;
