import {useEffect, useState} from 'react';
import styles from "./CreateEvent.module.css"
import axiosInstance from '../../../axios/axios';


const TagInput = ({tags, setTags}: {tags: string[], setTags: (tags: string[]) => void }) => {
    
    const [input,setInput] = useState('');
    const [recommendedTags, setRecommendedTags] = useState<String[]>();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === "Enter" || e.key === " ") {
            e.preventDefault(); 
            if(input.trim() !== '' && !tags.includes(input.trim()) && (input.length > 2 && input.length < 31)) {
                setTags([...tags, input.trim()])
                setInput('')
            }
        }
    }

    const removeTag = (index: number) => {
        setTags(tags.filter((_,i) => i !== index))
    }


    useEffect(() => {
      getTagRecommendations();
    },[])

    const getTagRecommendations = async () => {

      try {
        const response = await axiosInstance.get(`/tags/recommended`)
          setRecommendedTags(response.data)
      }
      catch(error) {
        console.log(error);
      }
    }

    return (
        <div className={styles.tagInputContainer}>
        <input
          type="text"
          maxLength={20}
          minLength={2}
          disabled={tags.length >= 4 ? true : false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= 4 ? "Tag limit is reached." : "Enter tags..."}
          style={{ border: "none", outline: "none" }}
        />
        <div className={styles.tagShow}>
        <hr/>
            <ul>
            {tags.map((tag, index) => (
              <li key={index}>
                <label onClick={() => removeTag(index)}>
                  #{tag} 
                </label>
              </li>
            ))}
            </ul>
        </div>
        <div className={styles.recommendedTagsContainer}>
            {recommendedTags?.map(tag => (
                <div>
                    <p>{tag}</p>
                </div>
            ))}
        </div>
        <p className={styles.tagCounter}>{input.length}/20</p>
      </div>
    );
}


export default TagInput;